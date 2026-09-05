from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.discount.views import DiscountRuleViewSet, ApprovalRuleViewSet

router = DefaultRouter()
router.register(r"rules", DiscountRuleViewSet, basename="discount-rule")
router.register(r"discounts", DiscountRuleViewSet, basename="discount")
router.register(r"approval-rules", ApprovalRuleViewSet, basename="approval-rule")

urlpatterns = [
    path("", include(router.urls)),
]
