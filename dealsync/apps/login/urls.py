from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.login.views import LoginViewSet

router = DefaultRouter()
router.register(r"", LoginViewSet, basename="login")

urlpatterns = [
    path("", include(router.urls)),
]
