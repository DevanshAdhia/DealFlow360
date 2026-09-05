from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.signup.views import SignupViewSet

router = DefaultRouter()
router.register(r"signups", SignupViewSet, basename="signup")

urlpatterns = [
    path("", include(router.urls)),
]
