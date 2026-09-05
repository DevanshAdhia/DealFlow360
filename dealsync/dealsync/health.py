import time
from django.db import connection, OperationalError
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import serializers, status
from drf_spectacular.utils import extend_schema, inline_serializer


@extend_schema(
    summary="Health Check",
    description="Health check endpoint for load balancers and monitoring tools.",
    responses={
        200: inline_serializer(
            name="HealthCheckResponse",
            fields={
                "status": serializers.CharField(help_text="Overall status: healthy or degraded"),
                "checks": serializers.DictField(help_text="Detailed subsystem health checks"),
            },
        ),
        503: inline_serializer(
            name="HealthCheckUnhealthyResponse",
            fields={
                "status": serializers.CharField(help_text="Overall status: unhealthy"),
                "checks": serializers.DictField(help_text="Detailed subsystem health checks"),
            },
        ),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for load balancers and monitoring tools."""
    checks = {}
    overall_status = "healthy"
    http_status = status.HTTP_200_OK

    # Database check
    try:
        start = time.monotonic()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks["database"] = {
            "status": "healthy",
            "response_time_ms": round((time.monotonic() - start) * 1000, 2),
        }
    except OperationalError as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}
        overall_status = "unhealthy"
        http_status = status.HTTP_503_SERVICE_UNAVAILABLE

    # Cache check
    try:
        start = time.monotonic()
        cache_key = "_health_check_ping"
        cache.set(cache_key, "pong", timeout=5)
        result = cache.get(cache_key)
        if result == "pong":
            checks["cache"] = {
                "status": "healthy",
                "response_time_ms": round((time.monotonic() - start) * 1000, 2),
            }
        else:
            checks["cache"] = {"status": "unhealthy", "error": "Cache read/write mismatch"}
            overall_status = "degraded"
    except Exception as e:
        checks["cache"] = {"status": "unhealthy", "error": str(e)}
        overall_status = "degraded"

    return Response(
        {
            "status": overall_status,
            "checks": checks,
        },
        status=http_status,
    )
