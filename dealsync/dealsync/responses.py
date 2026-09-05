from typing import Any, Optional
from rest_framework import status
from rest_framework.response import Response


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK,
) -> Response:
    """Return a standardised success response."""
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


def error_response(
    message: str = "An error occurred",
    code: str = "error",
    details: Optional[dict] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> Response:
    """Return a standardised error response."""
    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
        },
    }
    return Response(payload, status=status_code)


def created_response(data: Any, message: str = "Created successfully") -> Response:
    return success_response(data=data, message=message, status_code=status.HTTP_201_CREATED)


def no_content_response() -> Response:
    return Response(status=status.HTTP_204_NO_CONTENT)
