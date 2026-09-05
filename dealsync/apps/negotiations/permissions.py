from rest_framework import permissions


class IsNegotiationParticipantOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or getattr(request.user, "role", None) in ["ADMIN", "SALES_MANAGER"]:
            return True
        return obj.quotation.sales_rep_id == request.user.id or getattr(obj.quotation.customer, "user_id", None) == request.user.id
