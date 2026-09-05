from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.discount.models import Discount
from apps.discount.serializers import DiscountSerializer, DiscountCreateSerializer, DiscountUpdateSerializer
from apps.discount.services import DiscountService
from common.pagination import StandardResultsPagination
from common.responses import success_response, error_response


@extend_schema(tags=["Discount"])
class DiscountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Discount.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return DiscountCreateSerializer
        if self.action in ["update", "partial_update"]:
            return DiscountUpdateSerializer
        return DiscountSerializer

    @extend_schema(
        summary="List Discounts",
        description="Returns a paginated list of all active discounts.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Discount",
        description="Creates a new discount.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = DiscountService.create(**serializer.validated_data)
        return Response(
            DiscountSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Discount",
        description="Returns a single discount by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Discount",
        description="Updates an existing discount.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = DiscountService.update(instance=instance, **serializer.validated_data)
        return Response(DiscountSerializer(updated).data)

    @extend_schema(
        summary="Delete Discount",
        description="Deletes a discount.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        DiscountService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Discount",
        description="Activates a deactivated discount.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(DiscountSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Discount",
        description="Deactivates an active discount.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(DiscountSerializer(instance).data)
