from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.subscription.views import SubscriptionViewSet, InvoiceViewSet

router = DefaultRouter()
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
]
