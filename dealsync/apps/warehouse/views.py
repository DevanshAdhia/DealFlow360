from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema

from apps.warehouse.models import Warehouse, Inventory, Order
from apps.warehouse.serializers import WarehouseSerializer, InventorySerializer, OrderSerializer
from dealsync.pagination import StandardResultsPagination


@extend_schema(tags=["Warehouse"])
class WarehouseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Warehouse.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = WarehouseSerializer
    pagination_class = None


@extend_schema(tags=["Inventory"])
class InventoryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Inventory.objects.all().select_related("warehouse", "product").order_by("id")
    serializer_class = InventorySerializer
    pagination_class = StandardResultsPagination


@extend_schema(tags=["Order"])
class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Order.objects.all().select_related("customer", "quotation").order_by("-order_date")
    serializer_class = OrderSerializer
    pagination_class = StandardResultsPagination
