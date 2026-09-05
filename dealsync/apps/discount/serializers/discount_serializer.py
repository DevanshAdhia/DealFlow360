from rest_framework import serializers
from apps.discount.models import DiscountRule, ApprovalRule, ApprovalLevel, ApprovalRuleStep


class DiscountRuleSerializer(serializers.ModelSerializer):
    tier_name = serializers.CharField(source="customer_tier.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = DiscountRule
        fields = [
            "id", "name", "customer_tier", "tier_name", "category", "category_name",
            "max_discount_percent", "manager_threshold_percent",
            "finance_threshold_percent", "min_margin_percent", "is_active", "status", "created_at"
        ]

    def get_status(self, obj) -> str:
        return "Active" if getattr(obj, "is_active", True) else "Inactive"


class ApprovalRuleSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRule
        fields = ["id", "name", "min_risk_score", "max_risk_score", "is_active", "status"]

    def get_status(self, obj) -> str:
        return "Active" if getattr(obj, "is_active", True) else "Inactive"


# Backward compatibility
DiscountSerializer = DiscountRuleSerializer
DiscountCreateSerializer = DiscountRuleSerializer
DiscountUpdateSerializer = DiscountRuleSerializer
