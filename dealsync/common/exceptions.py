import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that returns a consistent JSON error format:

    {
        "success": false,
        "error": {
            "code": "validation_error",
            "message": "...",
            "details": {...}
        }
    }
    """
    # Convert Django ValidationError to DRF ValidationError
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError(detail=exc.message_dict if hasattr(exc, "message_dict") else exc.messages)

    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in view %s", context.get("view"))
        return Response(
            {
                "success": False,
                "error": {
                    "code": "internal_server_error",
                    "message": "An unexpected error occurred. Please try again later.",
                    "details": {},
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    error_code = _get_error_code(exc)
    message = _get_error_message(exc, response)

    response.data = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "details": _get_details(exc, response),
        },
    }

    return response


def _get_error_code(exc) -> str:
    if hasattr(exc, "default_code"):
        return exc.default_code
    return type(exc).__name__.lower().replace(" ", "_")


def _get_error_message(exc, response) -> str:
    if isinstance(exc, ValidationError):
        return "Validation failed. Please check the submitted data."
    if isinstance(exc, NotAuthenticated):
        return "Authentication credentials were not provided."
    if isinstance(exc, AuthenticationFailed):
        return "Invalid authentication credentials."
    if isinstance(exc, PermissionDenied):
        return "You do not have permission to perform this action."
    if isinstance(exc, Http404):
        return "The requested resource was not found."
    if hasattr(exc, "detail"):
        detail = exc.detail
        if isinstance(detail, str):
            return detail
        if isinstance(detail, list) and len(detail) == 1:
            return str(detail[0])
    return "An error occurred."


def _get_details(exc, response) -> dict:
    if isinstance(exc, ValidationError):
        return response.data if isinstance(response.data, dict) else {"errors": response.data}
    return {}
