from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.deal_health.views import DealAlertViewSet

router = DefaultRouter()
router.register(r"alerts", DealAlertViewSet, basename="deal-alert")

urlpatterns = [
    path("", include(router.urls)),
]
