from django.urls import path

from . import views

urlpatterns = [
    path("sync/", views.sync_products, name="sync-products"),
    path("checkout/", views.checkout, name="checkout"),
    path("products/", views.upsert_product, name="upsert-product"),
    path("payments/", views.record_payment, name="record-payment"),
    path("expenses/", views.create_expense, name="create-expense"),
    path("returns/", views.create_return, name="create-return"),
    path("reports/daily/", views.daily_report, name="daily-report"),
    path("transactions/", views.list_transactions, name="list-transactions"),
    path("customers/", views.customers_endpoint, name="customers-endpoint"),
    path("vendors/", views.vendors_endpoint, name="vendors-endpoint"),
    path("purchase-orders/", views.purchase_orders_endpoint, name="purchase-orders-endpoint"),
    path("shipments/", views.shipments_endpoint, name="shipments-endpoint"),
    path("categories/", views.categories_summary, name="categories-summary"),
]
