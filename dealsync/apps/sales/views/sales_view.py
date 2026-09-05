from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.sales.models import Sales
from apps.sales.serializers import SalesSerializer, SalesCreateSerializer, SalesUpdateSerializer
from apps.sales.services import SalesService
from dealsync.pagination import StandardResultsPagination
from dealsync.responses import success_response, error_response


@extend_schema(tags=["Sales"])
class SalesViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Sales.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return SalesCreateSerializer
        if self.action in ["update", "partial_update"]:
            return SalesUpdateSerializer
        return SalesSerializer

    @extend_schema(
        summary="List Saless",
        description="Returns a paginated list of all active saless.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Sales",
        description="Creates a new sales.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = SalesService.create(**serializer.validated_data)
        return Response(
            SalesSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Sales",
        description="Returns a single sales by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Sales",
        description="Updates an existing sales.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = SalesService.update(instance=instance, **serializer.validated_data)
        return Response(SalesSerializer(updated).data)

    @extend_schema(
        summary="Delete Sales",
        description="Deletes a sales.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        SalesService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Sales",
        description="Activates a deactivated sales.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(SalesSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Sales",
        description="Deactivates an active sales.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(SalesSerializer(instance).data)
