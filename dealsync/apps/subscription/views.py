from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from apps.subscription.models import Subscription, Invoice
from apps.subscription.serializers import SubscriptionSerializer, InvoiceSerializer
from dealsync.pagination import StandardResultsPagination


@extend_schema(tags=["Subscription"])
class SubscriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Subscription.objects.all().select_related("customer", "plan").order_by("-created_at")
    serializer_class = SubscriptionSerializer
    pagination_class = StandardResultsPagination


@extend_schema(tags=["Invoice"])
class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Invoice.objects.all().select_related("customer", "quotation").order_by("-created_at")
    serializer_class = InvoiceSerializer
    pagination_class = StandardResultsPagination
