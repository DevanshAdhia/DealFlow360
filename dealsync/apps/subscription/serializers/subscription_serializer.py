from rest_framework import serializers
from apps.subscription.models import Subscription, SubscriptionPlan, Invoice, Payment


class SubscriptionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = Subscription
        fields = ["id", "customer", "customer_name", "plan", "plan_name", "status", "start_date", "next_billing_date", "is_active", "created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "customer", "customer_name", "quotation", "subscription",
            "invoice_type", "status", "subtotal", "tax_amount", "total_amount", "due_date", "created_at"
        ]


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["customer", "plan", "status", "start_date", "next_billing_date"]


class SubscriptionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ["customer", "plan", "status", "start_date", "next_billing_date", "is_active"]
