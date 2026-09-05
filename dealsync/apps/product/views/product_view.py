from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.product.models import Product
from apps.product.serializers import ProductSerializer, ProductCreateSerializer, ProductUpdateSerializer
from apps.product.services import ProductService
from common.pagination import StandardResultsPagination
from common.responses import success_response, error_response


@extend_schema(tags=["Product"])
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        if self.action in ["update", "partial_update"]:
            return ProductUpdateSerializer
        return ProductSerializer

    @extend_schema(
        summary="List Products",
        description="Returns a paginated list of all active products.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Product",
        description="Creates a new product.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = ProductService.create(**serializer.validated_data)
        return Response(
            ProductSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Product",
        description="Returns a single product by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Product",
        description="Updates an existing product.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = ProductService.update(instance=instance, **serializer.validated_data)
        return Response(ProductSerializer(updated).data)

    @extend_schema(
        summary="Delete Product",
        description="Deletes a product.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        ProductService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Product",
        description="Activates a deactivated product.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(ProductSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Product",
        description="Deactivates an active product.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(ProductSerializer(instance).data)
