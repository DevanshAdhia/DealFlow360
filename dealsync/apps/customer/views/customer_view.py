from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.customer.models import Customer
from apps.customer.serializers import CustomerSerializer, CustomerCreateSerializer, CustomerUpdateSerializer
from apps.customer.services import CustomerService
from dealsync.pagination import StandardResultsPagination
from dealsync.responses import success_response, error_response


@extend_schema(tags=["Customer"])
class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Customer.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return CustomerCreateSerializer
        if self.action in ["update", "partial_update"]:
            return CustomerUpdateSerializer
        return CustomerSerializer

    @extend_schema(
        summary="List Customers",
        description="Returns a paginated list of all active customers.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Customer",
        description="Creates a new customer.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = CustomerService.create(**serializer.validated_data)
        return Response(
            CustomerSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Customer",
        description="Returns a single customer by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Customer",
        description="Updates an existing customer.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = CustomerService.update(instance=instance, **serializer.validated_data)
        return Response(CustomerSerializer(updated).data)

    @extend_schema(
        summary="Delete Customer",
        description="Deletes a customer.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        CustomerService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Customer",
        description="Activates a deactivated customer.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(CustomerSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Customer",
        description="Deactivates an active customer.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(CustomerSerializer(instance).data)
