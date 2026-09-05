from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsQuotationOwner(BasePermission):
    """
    A custom object-level permission is required because authorization depends
    on the relationship between the authenticated user and the sales_rep_id on the requested object.
    """

    def has_object_permission(self, request, view, obj) -> bool:  # type: ignore
        if request.user and request.user.is_staff:
            return True
        return str(getattr(request.user, "id", "")) == str(getattr(obj, "sales_rep_id", ""))


class IsSalesAdminOrReadOnly(BasePermission):
    """
    A custom permission class is used because read operations are open to authenticated sales staff
    while write/delete operations require elevated staff or admin permissions.
    """

    def has_permission(self, request, view) -> bool:  # type: ignore
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)
