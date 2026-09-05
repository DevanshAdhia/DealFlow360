from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.warehouse.views import WarehouseViewSet, InventoryViewSet, OrderViewSet

router = DefaultRouter()
router.register(r"warehouses", WarehouseViewSet, basename="warehouse")
router.register(r"inventories", InventoryViewSet, basename="inventory")
router.register(r"orders", OrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
]
