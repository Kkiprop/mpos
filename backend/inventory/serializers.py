from rest_framework import serializers

from .models import (
    Customer,
    Expense,
    Payment,
    Product,
    Return,
    Transaction,
    TransactionItem,
    Vendor,
    PurchaseOrder,
    PurchaseOrderItem,
    Shipment,
)


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "phone", "email", "notes"]


class ProductSyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "barcode", "name", "price", "brand"]


class ProductUpsertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["barcode", "name", "price", "brand"]


class TransactionItemSerializer(serializers.ModelSerializer):
    product_barcode = serializers.CharField(source="product.barcode", read_only=True)

    class Meta:
        model = TransactionItem
        fields = ["product_barcode", "quantity", "price_at_sale"]


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "timestamp",
            "total_amount",
            "cashier_id",
            "discount_amount",
            "customer",
            "items",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "transaction", "amount", "method", "timestamp"]


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "category", "amount", "description", "recorded_by", "created_at"]


class ReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Return
        fields = ["id", "transaction_item", "quantity", "reason", "created_at"]


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ["id", "name", "phone", "email", "address", "notes", "created_at"]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_barcode = serializers.CharField(source="product.barcode", read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_barcode",
            "quantity",
            "unit_cost",
        ]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        source="vendor", queryset=Vendor.objects.all(), write_only=True
    )
    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ["id", "vendor", "vendor_id", "created_at", "total_amount", "items"]


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            "id",
            "transaction",
            "address",
            "status",
            "notes",
            "created_at",
            "delivered_at",
        ]
