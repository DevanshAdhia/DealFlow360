from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.product.views import ProductViewSet, CategoryViewSet, PriceListViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"price-lists", PriceListViewSet, basename="price-list")
router.register(r"products", ProductViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
]
