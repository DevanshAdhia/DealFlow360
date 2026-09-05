from django.contrib import admin
from apps.subscription.models import Subscription, SubscriptionPlan, Invoice, Payment


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "billing_interval", "price", "is_active")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "plan", "status", "start_date", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("customer__name", "plan__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice_number", "customer", "invoice_type", "status", "total_amount", "created_at")
    list_filter = ("status", "invoice_type")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "invoice", "amount", "payment_method", "paid_at")
