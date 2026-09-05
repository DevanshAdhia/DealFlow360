from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.negotiations.views import CustomerNegotiationViewSet

router = DefaultRouter()
router.register(r"negotiations", CustomerNegotiationViewSet, basename="negotiation")

urlpatterns = [
    path("", include(router.urls)),
]
