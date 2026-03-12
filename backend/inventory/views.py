from decimal import Decimal
from datetime import datetime, timedelta

from django.db import transaction as db_transaction
from django.db.models import F, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Customer, Expense, Payment, Product, Return, Transaction, TransactionItem
from .serializers import (
    CustomerSerializer,
    ExpenseSerializer,
    PaymentSerializer,
    ProductSyncSerializer,
    ProductUpsertSerializer,
    ReturnSerializer,
    TransactionSerializer,
)


@api_view(["GET"])
def sync_products(request):
    products = Product.objects.all().only("id", "barcode", "name", "price", "brand")
    serializer = ProductSyncSerializer(products, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def upsert_product(request):
    serializer = ProductUpsertSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    barcode = data["barcode"]

    product, _created = Product.objects.update_or_create(
        barcode=barcode,
        defaults={
            "name": data["name"],
            "price": data["price"],
            "brand": data.get("brand", ""),
        },
    )

    response_serializer = ProductSyncSerializer(product)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def checkout(request):
    """Process a checkout request.

    Expected payload:
    {
        "cashier_id": "string",
        "items": [
            {"barcode": "123", "quantity": 2},
            ...
        ],
        "customer": {"name": "Optional name", "phone": ""},
        "discount_amount": 0.0
    }
    """

    data = request.data or {}
    items = data.get("items") or []
    cashier_id = data.get("cashier_id") or "unknown"
    customer_payload = data.get("customer") or None
    discount_amount_raw = data.get("discount_amount") or 0

    try:
        discount_amount = Decimal(str(discount_amount_raw))
    except Exception:
        discount_amount = Decimal("0.00")

    if not isinstance(items, list) or not items:
        return Response({"detail": "No items provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Normalize and validate requested items
    normalized_items: list[dict] = []
    for raw in items:
        try:
            barcode = str(raw.get("barcode")).strip()
            quantity = int(raw.get("quantity", 0))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid item payload."}, status=status.HTTP_400_BAD_REQUEST)

        if not barcode or quantity <= 0:
            return Response({"detail": "Each item must include a valid barcode and positive quantity."}, status=status.HTTP_400_BAD_REQUEST)

        normalized_items.append({"barcode": barcode, "quantity": quantity})

    with db_transaction.atomic():
        products_by_barcode = {
            p.barcode: p
            for p in Product.objects.select_for_update().filter(
                barcode__in=[i["barcode"] for i in normalized_items]
            )
        }

        if len(products_by_barcode) != len(normalized_items):
            missing = [i["barcode"] for i in normalized_items if i["barcode"] not in products_by_barcode]
            return Response(
                {"detail": "One or more products not found.", "missing_barcodes": missing},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = Decimal("0.00")
        line_items: list[dict] = []

        # Validate stock and compute totals
        for item in normalized_items:
            product = products_by_barcode[item["barcode"]]
            quantity = item["quantity"]

            if product.stock_quantity < quantity:
                return Response(
                    {
                        "detail": "Insufficient stock for product.",
                        "barcode": product.barcode,
                        "available_stock": product.stock_quantity,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            line_total = product.price * quantity
            total_amount += line_total
            line_items.append({
                "product": product,
                "quantity": quantity,
                "price_at_sale": product.price,
            })

        # Optionally resolve customer
        customer_obj = None
        if isinstance(customer_payload, dict) and customer_payload.get("name"):
            customer_serializer = CustomerSerializer(data=customer_payload)
            customer_serializer.is_valid(raise_exception=True)
            customer_obj, _ = Customer.objects.get_or_create(
                name=customer_serializer.validated_data["name"],
                phone=customer_serializer.validated_data.get("phone", ""),
                defaults={
                    "email": customer_serializer.validated_data.get("email", ""),
                    "notes": customer_serializer.validated_data.get("notes", ""),
                },
            )

        # Persist transaction and decrement stock
        transaction_obj = Transaction.objects.create(
            timestamp=timezone.now(),
            total_amount=total_amount,
            cashier_id=cashier_id,
            customer=customer_obj,
            discount_amount=discount_amount,
        )

        for li in line_items:
            TransactionItem.objects.create(
                transaction=transaction_obj,
                product=li["product"],
                quantity=li["quantity"],
                price_at_sale=li["price_at_sale"],
            )

            Product.objects.filter(pk=li["product"].pk).update(
                stock_quantity=F("stock_quantity") - li["quantity"],
                last_updated=timezone.now(),
            )

        response_serializer = TransactionSerializer(transaction_obj)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def record_payment(request):
    """Record a payment against a transaction, including partial/credit sales.

    Payload:
    {
        "transaction_id": int,
        "amount": number,
        "method": "cash" | "credit" | "airtel" | "mpesa" | "card"
    }
    """

    data = request.data or {}
    transaction_id = data.get("transaction_id")
    amount_raw = data.get("amount")
    method = data.get("method")

    if not transaction_id or amount_raw is None or not method:
        return Response(
            {"detail": "transaction_id, amount and method are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        amount = Decimal(str(amount_raw))
    except Exception:
        return Response({"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

    if amount <= 0:
        return Response({"detail": "Amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction_obj = Transaction.objects.get(pk=transaction_id)
    except Transaction.DoesNotExist:
        return Response({"detail": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

    payment = Payment.objects.create(
        transaction=transaction_obj,
        amount=amount,
        method=method,
    )

    # Compute how much has been paid so far
    paid_total = (
        transaction_obj.payments.aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )
    net_due = transaction_obj.total_amount - transaction_obj.discount_amount
    outstanding = net_due - paid_total

    serializer = PaymentSerializer(payment)
    return Response(
        {
            "payment": serializer.data,
            "transaction_id": transaction_obj.pk,
            "total_amount": transaction_obj.total_amount,
            "discount_amount": transaction_obj.discount_amount,
            "paid_total": paid_total,
            "outstanding": outstanding,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def create_expense(request):
    serializer = ExpenseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    expense = serializer.save()
    return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def create_return(request):
    serializer = ReturnSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    ret = serializer.save()
    return Response(ReturnSerializer(ret).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def daily_report(request):
    """Return daily KPIs including sales, expenses, profit, returns and average basket.

    Optional query param: ?date=YYYY-MM-DD (defaults to today, server time).
    """

    date_str = request.query_params.get("date")
    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"detail": "Invalid date format, expected YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        target_date = timezone.localdate()

    def _range_for(d):
        start = datetime.combine(d, datetime.min.time(), tzinfo=timezone.get_current_timezone())
        end = start + timedelta(days=1)
        return start, end

    def _stats_for(d):
        start, end = _range_for(d)
        tx_qs = Transaction.objects.filter(timestamp__gte=start, timestamp__lt=end)
        sales_total = tx_qs.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
        discounts_total = tx_qs.aggregate(total=Sum("discount_amount"))["total"] or Decimal("0.00")
        tx_count = tx_qs.count()

        # Customers counted as distinct non-null customers, falling back to transactions
        customer_count = (
            tx_qs.exclude(customer__isnull=True)
            .values("customer")
            .distinct()
            .count()
        )
        denom = customer_count or tx_count or 1
        average_basket = (sales_total - discounts_total) / denom

        expense_qs = Expense.objects.filter(created_at__date=d)
        expenses_total = expense_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        # Approximate returns value as quantity * line price
        return_qs = Return.objects.filter(created_at__date=d)
        returns_value = Decimal("0.00")
        for r in return_qs.select_related("transaction_item"):
            returns_value += r.quantity * r.transaction_item.price_at_sale

        profit = sales_total - discounts_total - expenses_total - returns_value

        return {
            "sales_total": sales_total,
            "discounts_total": discounts_total,
            "transactions": tx_count,
            "customers": customer_count,
            "average_basket": average_basket,
            "expenses_total": expenses_total,
            "returns_value": returns_value,
            "profit": profit,
        }

    today_stats = _stats_for(target_date)
    last_week_stats = _stats_for(target_date - timedelta(days=7))
    last_year_stats = _stats_for(target_date - timedelta(days=365))

    return Response(
        {
            "date": str(target_date),
            "today": today_stats,
            "same_day_last_week": last_week_stats,
            "same_day_last_year": last_year_stats,
        }
    )
