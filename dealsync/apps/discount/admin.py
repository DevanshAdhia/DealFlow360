from django.contrib import admin
from apps.discount.models import (
    DiscountRule,
    ApprovalLevel,
    ApprovalRule,
    ApprovalRuleStep,
    QuotationApproval,
)


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_tier", "category", "max_discount_percent", "min_margin_percent", "created_at")
    list_filter = ("customer_tier", "category", "created_at")
    search_fields = ("customer_tier__name", "category__name")
    readonly_fields = ("created_at",)


@admin.register(ApprovalLevel)
class ApprovalLevelAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "sequence", "required_role")


@admin.register(ApprovalRule)
class ApprovalRuleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "min_risk_score", "max_risk_score")


@admin.register(QuotationApproval)
class QuotationApprovalAdmin(admin.ModelAdmin):
    list_display = ("id", "quotation", "approval_level", "approver", "status", "decided_at")
    list_filter = ("status", "approval_level")
