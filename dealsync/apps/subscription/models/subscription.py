from django.db import models
from apps.customer.models import Customer
from apps.product.models import Product


class SubscriptionPlan(models.Model):
    INTERVAL_CHOICES = (
        ("MONTHLY", "Monthly"),
        ("QUARTERLY", "Quarterly"),
        ("ANNUALLY", "Annually"),
    )

    name = models.CharField(max_length=100)
    billing_interval = models.CharField(max_length=20, choices=INTERVAL_CHOICES, default="MONTHLY")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "subscription_plans"

    def __str__(self) -> str:
        return f"{self.name} ({self.get_billing_interval_display()})"


class Subscription(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("PAUSED", "Paused"),
        ("CANCELLED", "Cancelled"),
        ("EXPIRED", "Expired"),
    )

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, null=True, blank=True, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    start_date = models.DateField(null=True, blank=True)
    next_billing_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "subscription"
        db_table = "subscriptions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Sub {self.id}: {self.customer.name if self.customer else 'N/A'}"


class SubscriptionItem(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, null=True, blank=True, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = "subscription_items"

    def __str__(self) -> str:
        return f"{self.subscription_id} - {self.product.name if self.product else 'N/A'}"


class BillingSchedule(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("INVOICED", "Invoiced"),
        ("COMPLETED", "Completed"),
    )

    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, null=True, blank=True, related_name="schedules")
    scheduled_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = "billing_schedules"
        ordering = ["scheduled_date"]

    def __str__(self) -> str:
        return f"Schedule {self.scheduled_date} - {self.amount} [{self.status}]"


class Invoice(models.Model):
    TYPE_CHOICES = (
        ("ONE_TIME", "One Time"),
        ("RECURRING", "Recurring"),
        ("CREDIT", "Credit"),
    )

    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("ISSUED", "Issued"),
        ("PAID", "Paid"),
        ("PARTIALLY_PAID", "Partially Paid"),
        ("OVERDUE", "Overdue"),
        ("VOID", "Void"),
    )

    invoice_number = models.CharField(max_length=64, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, null=True, blank=True, related_name="invoices")
    quotation = models.ForeignKey("sales.Quotation", on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    invoice_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="ONE_TIME")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "invoices"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Invoice {self.invoice_number} ({self.status})"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name="items")
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    class Meta:
        db_table = "invoice_items"

    def __str__(self) -> str:
        return f"{self.invoice_id} - {self.description}"


class Payment(models.Model):
    METHOD_CHOICES = (
        ("CREDIT_CARD", "Credit Card"),
        ("BANK_TRANSFER", "Bank Transfer"),
        ("CHEQUE", "Cheque"),
    )

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name="payments")
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default="BANK_TRANSFER")
    reference_number = models.CharField(max_length=100, blank=True, default="")
    paid_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments"

    def __str__(self) -> str:
        return f"Payment {self.amount} for Invoice {self.invoice_id}"


class CreditNote(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name="credit_notes")
    amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    reason = models.TextField(blank=True, default="")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "credit_notes"

    def __str__(self) -> str:
        return f"CreditNote {self.amount} for Invoice {self.invoice_id}"
