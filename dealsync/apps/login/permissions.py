from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import View
from apps.signup.models import UserRole


class HasRole(BasePermission):
    """Base permission class to enforce role-based access control (RBAC)."""
    allowed_roles = []

    def has_permission(self, request: Request, view: View) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        profile = getattr(request.user, "profile", None)
        if not profile:
            return False
        return profile.role in self.allowed_roles


class IsAdminRole(HasRole):
    """Access restricted to Admin role or superuser."""
    allowed_roles = [UserRole.ADMIN]


class IsSalesManagerRole(HasRole):
    """Access restricted to Sales Manager or Admin role."""
    allowed_roles = [UserRole.SALES_MANAGER, UserRole.ADMIN]


class IsSalesRepRole(HasRole):
    """Access restricted to Sales Representative, Sales Manager, or Admin role."""
    allowed_roles = [UserRole.SALES_REP, UserRole.SALES_MANAGER, UserRole.ADMIN]


class IsFinanceRole(HasRole):
    """Access restricted to Finance / Operations or Admin role."""
    allowed_roles = [UserRole.FINANCE, UserRole.ADMIN]


class IsCustomerRole(HasRole):
    """Access restricted to Customer or Admin role."""
    allowed_roles = [UserRole.CUSTOMER, UserRole.ADMIN]


class IsLoginOwner(BasePermission):
    """Allow access only to the owner of the object."""
    def has_object_permission(self, request: Request, view: View, obj) -> bool:
        return True


class IsLoginAdminOrReadOnly(BasePermission):
    """Allow read to all authenticated, write only to admins."""
    def has_permission(self, request: Request, view: View) -> bool:
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)
