from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.customer.views import CustomerViewSet, CustomerTierViewSet

router = DefaultRouter()
router.register(r"tiers", CustomerTierViewSet, basename="customer-tier")
router.register(r"customers", CustomerViewSet, basename="customer")

urlpatterns = [
    path("", include(router.urls)),
]
