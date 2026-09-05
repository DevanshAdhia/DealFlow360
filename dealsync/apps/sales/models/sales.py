import uuid
from typing import TYPE_CHECKING, Any
from django.db import models
from django.conf import settings
from apps.customer.models import Customer
from apps.product.models import Product, ProductVariant


class QuotationStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    SENT = "SENT", "Sent"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"
    EXPIRED = "EXPIRED", "Expired"


class ApprovalStatus(models.TextChoices):
    NOT_REQUIRED = "NOT_REQUIRED", "Not Required"
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class Quotation(models.Model):
    if TYPE_CHECKING:
        items: Any
        versions: Any

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation_number = models.CharField(max_length=64, unique=True, db_index=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotations"
    )
    sales_rep = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotations"
    )
    
    status = models.CharField(
        max_length=32,
        choices=QuotationStatus.choices,
        default=QuotationStatus.DRAFT,
        db_index=True,
    )
    approval_status = models.CharField(
        max_length=32,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.NOT_REQUIRED,
        db_index=True,
    )
    
    valid_until = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=10, default="INR")
    notes = models.TextField(blank=True, default="")
    
    # Financial Totals (Authoritatively calculated on backend)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    cost_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    margin_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    margin_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    blended_risk_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "sales"
        verbose_name = "Quotation"
        verbose_name_plural = "Quotations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"], name="idx_quote_status_created"),
        ]
        constraints = [
            models.CheckConstraint(check=models.Q(subtotal__gte=0), name="quotation_subtotal_non_negative"),
            models.CheckConstraint(check=models.Q(total_amount__gte=0), name="quotation_total_non_negative"),
        ]

    def __str__(self) -> str:
        return f"{self.quotation_number} ({self.status})"

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


class QuotationItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotation_items"
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotation_items"
    )
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    cost_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    margin_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    margin_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "sales"
        verbose_name = "Quotation Item"
        verbose_name_plural = "Quotation Items"
        ordering = ["created_at"]
        constraints = [
            models.CheckConstraint(check=models.Q(quantity__gt=0), name="item_quantity_positive"),
            models.CheckConstraint(check=models.Q(discount_percent__gte=0) & models.Q(discount_percent__lte=100), name="item_discount_pct_range"),
        ]

    def __str__(self) -> str:
        return f"{self.product_name} x {self.quantity}"


class QuotationVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    snapshot_data = models.JSONField()
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotation_versions"
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    change_reason = models.TextField(blank=True, default="")

    class Meta:
        app_label = "sales"
        verbose_name = "Quotation Version"
        verbose_name_plural = "Quotation Versions"
        ordering = ["-version_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["quotation", "version_number"],
                name="unique_quotation_version_number",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.quotation.quotation_number} - v{self.version_number}"
