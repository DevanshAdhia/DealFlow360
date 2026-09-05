from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.sales.views import SalesViewSet

router = DefaultRouter()
router.register(r"saless", SalesViewSet, basename="sales")

urlpatterns = [
    path("", include(router.urls)),
]
