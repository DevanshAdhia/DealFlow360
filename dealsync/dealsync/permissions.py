from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import View


class IsAdminOrReadOnly(BasePermission):
    """Allow read-only access to authenticated users; write access to admins."""

    def has_permission(self, request: Request, view: View) -> bool:
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)


class IsOwnerOrAdmin(BasePermission):
    """Allow access to object owner or admin staff."""

    def has_object_permission(self, request: Request, view: View, obj) -> bool:
        if request.user and request.user.is_staff:
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "owner"):
            return obj.owner == request.user
        return False


class IsStaffUser(BasePermission):
    """Allow access only to staff users."""

    def has_permission(self, request: Request, view: View) -> bool:
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
