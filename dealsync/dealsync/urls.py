from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (SpectacularAPIView,SpectacularSwaggerView,SpectacularRedocView)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from dealsync.health import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    # JWT Authentication Endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # App URLs
    path("api/", include("apps.sales.urls")),
    path("api/login/", include("apps.login.urls")),
    path("api/signup/", include("apps.signup.urls")),
    path("api/product/", include("apps.product.urls")),
    path("api/discount/", include("apps.discount.urls")),
    path("api/warehouse/", include("apps.warehouse.urls")),
    path("api/subscription/", include("apps.subscription.urls")),
    path("api/customer/", include("apps.customer.urls")),
    path("api/negotiations/", include("apps.negotiations.urls")),
    path("api/deal-health/", include("apps.deal_health.urls")),
    path("api/reports/", include("apps.reports.urls")),
    # API Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui-alias"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
