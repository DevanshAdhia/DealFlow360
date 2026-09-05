from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from apps.discount.models import DiscountRule, ApprovalRule
from apps.discount.serializers import DiscountRuleSerializer, ApprovalRuleSerializer


@extend_schema(tags=["DiscountRule"])
class DiscountRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = DiscountRule.objects.all().select_related("customer_tier", "category").order_by("-created_at")
    serializer_class = DiscountRuleSerializer
    pagination_class = None


@extend_schema(tags=["ApprovalRule"])
class ApprovalRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = ApprovalRule.objects.all().order_by("min_risk_score")
    serializer_class = ApprovalRuleSerializer
    pagination_class = None


# Backward compatibility
DiscountViewSet = DiscountRuleViewSet
