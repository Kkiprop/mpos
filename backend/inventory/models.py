from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name or f"Customer {self.pk}"


class Product(models.Model):
    barcode = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=128, blank=True)
    brand = models.CharField(max_length=128, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.barcode})"


class Transaction(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    cashier_id = models.CharField(max_length=64)
    customer = models.ForeignKey(
        Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name="transactions"
    )
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self) -> str:
        return f"Transaction {self.pk} - {self.timestamp.isoformat()}"


class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"{self.product.name} x {self.quantity}"


class Payment(models.Model):
    METHOD_CASH = "cash"
    METHOD_CREDIT = "credit"
    METHOD_AIRTEL = "airtel"
    METHOD_MPESA = "mpesa"
    METHOD_CARD = "card"

    METHOD_CHOICES = [
        (METHOD_CASH, "Cash"),
        (METHOD_CREDIT, "Credit"),
        (METHOD_AIRTEL, "Airtel"),
        (METHOD_MPESA, "M-Pesa"),
        (METHOD_CARD, "Card"),
    ]

    transaction = models.ForeignKey(
        Transaction, related_name="payments", on_delete=models.CASCADE
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=16, choices=METHOD_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Payment {self.amount} {self.method} for Tx {self.transaction_id}"


class Expense(models.Model):
    CATEGORY_STOCK = "stock"
    CATEGORY_PAYROLL = "payroll"
    CATEGORY_UTILITIES = "utilities"
    CATEGORY_OTHER = "other"

    CATEGORY_CHOICES = [
        (CATEGORY_STOCK, "Stock"),
        (CATEGORY_PAYROLL, "Payroll"),
        (CATEGORY_UTILITIES, "Utilities"),
        (CATEGORY_OTHER, "Other"),
    ]

    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    recorded_by = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Expense {self.category} {self.amount}"


class Return(models.Model):
    transaction_item = models.ForeignKey(
        TransactionItem, related_name="returns", on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Return {self.quantity} of {self.transaction_item_id}"


class Vendor(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name or f"Vendor {self.pk}"


class PurchaseOrder(models.Model):
    vendor = models.ForeignKey(Vendor, related_name="purchase_orders", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self) -> str:
        return f"PO {self.pk} for {self.vendor_id}"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self) -> str:
        return f"POItem {self.product_id} x {self.quantity}"


class Shipment(models.Model):
    transaction = models.ForeignKey(Transaction, related_name="shipments", on_delete=models.CASCADE)
    address = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=32, default="pending")
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Shipment {self.pk} for Tx {self.transaction_id}"
