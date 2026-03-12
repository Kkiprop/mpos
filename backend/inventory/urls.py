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
]
