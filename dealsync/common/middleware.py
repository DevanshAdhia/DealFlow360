import logging
import time
import uuid
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Logs every request with method, path, status, and duration."""

    def process_request(self, request):
        request._start_time = time.monotonic()
        request._request_id = str(uuid.uuid4())
        request.META["HTTP_X_REQUEST_ID"] = request._request_id

    def process_response(self, request, response):
        duration_ms = 0
        if hasattr(request, "_start_time"):
            duration_ms = round((time.monotonic() - request._start_time) * 1000, 2)

        request_id = getattr(request, "_request_id", "-")

        logger.info(
            "%s %s %s %s %.2fms",
            request.method,
            request.get_full_path(),
            response.status_code,
            request_id,
            duration_ms,
        )

        response["X-Request-ID"] = request_id
        response["X-Response-Time"] = f"{duration_ms}ms"
        return response
