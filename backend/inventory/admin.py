from django.contrib import admin

from .models import Product, Transaction, TransactionItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "barcode", "name", "price", "stock_quantity", "category", "last_updated")
    search_fields = ("barcode", "name", "category")
    list_filter = ("category",)


class TransactionItemInline(admin.TabularInline):
    model = TransactionItem
    extra = 0


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "timestamp", "total_amount", "cashier_id")
    list_filter = ("timestamp", "cashier_id")
    inlines = [TransactionItemInline]


@admin.register(TransactionItem)
class TransactionItemAdmin(admin.ModelAdmin):
    list_display = ("id", "transaction", "product", "quantity", "price_at_sale")
