from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.warehouse.models import Warehouse
from apps.warehouse.serializers import WarehouseSerializer, WarehouseCreateSerializer, WarehouseUpdateSerializer
from apps.warehouse.services import WarehouseService
from dealsync.pagination import StandardResultsPagination
from dealsync.responses import success_response, error_response


@extend_schema(tags=["Warehouse"])
class WarehouseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Warehouse.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return WarehouseCreateSerializer
        if self.action in ["update", "partial_update"]:
            return WarehouseUpdateSerializer
        return WarehouseSerializer

    @extend_schema(
        summary="List Warehouses",
        description="Returns a paginated list of all active warehouses.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Warehouse",
        description="Creates a new warehouse.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = WarehouseService.create(**serializer.validated_data)
        return Response(
            WarehouseSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Warehouse",
        description="Returns a single warehouse by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Warehouse",
        description="Updates an existing warehouse.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = WarehouseService.update(instance=instance, **serializer.validated_data)
        return Response(WarehouseSerializer(updated).data)

    @extend_schema(
        summary="Delete Warehouse",
        description="Deletes a warehouse.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        WarehouseService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Warehouse",
        description="Activates a deactivated warehouse.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(WarehouseSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Warehouse",
        description="Deactivates an active warehouse.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(WarehouseSerializer(instance).data)
