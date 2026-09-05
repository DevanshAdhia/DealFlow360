from rest_framework.permissions import BasePermission, IsAdminUser, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.views import View


class IsLoginOwner(BasePermission):
    """Allow access only to the owner of the object."""

    def has_object_permission(self, request: Request, view: View, obj) -> bool:
        # Adjust this logic based on your ownership model.
        # Example: if the model has a 'user' FK, check request.user == obj.user
        return True


class IsLoginAdminOrReadOnly(BasePermission):
    """Allow read to all authenticated, write only to admins."""

    def has_permission(self, request: Request, view: View) -> bool:
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)
