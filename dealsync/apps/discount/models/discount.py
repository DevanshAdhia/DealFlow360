from django.db import models
from django.conf import settings
from apps.customer.models import CustomerTier
from apps.product.models import Category


class DiscountRule(models.Model):
    customer_tier = models.ForeignKey(CustomerTier, on_delete=models.CASCADE, null=True, blank=True, related_name="discount_rules")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name="discount_rules")
    max_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    manager_threshold_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    finance_threshold_percent = models.DecimalField(max_digits=5, decimal_places=2, default=25.00)
    min_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "discount_rules"
        unique_together = ("customer_tier", "category")

    def __str__(self) -> str:
        tier_name = self.customer_tier.name if self.customer_tier else "All"
        cat_name = self.category.name if self.category else "All"
        return f"Rule: {tier_name} - {cat_name} (Max {self.max_discount_percent}%)"


class ApprovalLevel(models.Model):
    name = models.CharField(max_length=50)
    sequence = models.PositiveIntegerField(default=1)
    required_role = models.CharField(max_length=50, default="SALES_MANAGER")

    class Meta:
        db_table = "approval_levels"
        ordering = ["sequence"]

    def __str__(self) -> str:
        return f"Level {self.sequence}: {self.name} ({self.required_role})"


class ApprovalRule(models.Model):
    name = models.CharField(max_length=100)
    min_risk_score = models.IntegerField(default=0)
    max_risk_score = models.IntegerField(default=100)

    class Meta:
        db_table = "approval_rules"

    def __str__(self) -> str:
        return f"{self.name} (Risk {self.min_risk_score}-{self.max_risk_score})"


class ApprovalRuleStep(models.Model):
    approval_rule = models.ForeignKey(ApprovalRule, on_delete=models.CASCADE, null=True, blank=True, related_name="steps")
    approval_level = models.ForeignKey(ApprovalLevel, on_delete=models.CASCADE, null=True, blank=True)
    sequence = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "approval_rule_steps"
        ordering = ["sequence"]

    def __str__(self) -> str:
        return f"Step {self.sequence}"


class QuotationApproval(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("RETURNED", "Returned"),
    )

    quotation = models.ForeignKey("sales.Quotation", on_delete=models.CASCADE, null=True, blank=True, related_name="approvals")
    approval_level = models.ForeignKey(ApprovalLevel, on_delete=models.PROTECT, null=True, blank=True)
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    sequence = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    comments = models.TextField(blank=True, default="")
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quotation_approvals"
        ordering = ["sequence"]

    def __str__(self) -> str:
        return f"Quotation {self.quotation_id} - [{self.status}]"


# Alias for backward compatibility
Discount = DiscountRule
