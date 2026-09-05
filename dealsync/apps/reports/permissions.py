from rest_framework import permissions


class CanGenerateReports(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or getattr(request.user, "role", None) in ["ADMIN", "SALES_MANAGER", "FINANCE"]:
            return True
        return obj.generated_by_id == request.user.id
