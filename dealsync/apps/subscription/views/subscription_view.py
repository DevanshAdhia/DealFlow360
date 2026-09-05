from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.subscription.models import Subscription
from apps.subscription.serializers import SubscriptionSerializer, SubscriptionCreateSerializer, SubscriptionUpdateSerializer
from apps.subscription.services import SubscriptionService
from common.pagination import StandardResultsPagination
from common.responses import success_response, error_response


@extend_schema(tags=["Subscription"])
class SubscriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Subscription.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return SubscriptionCreateSerializer
        if self.action in ["update", "partial_update"]:
            return SubscriptionUpdateSerializer
        return SubscriptionSerializer

    @extend_schema(
        summary="List Subscriptions",
        description="Returns a paginated list of all active subscriptions.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Subscription",
        description="Creates a new subscription.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = SubscriptionService.create(**serializer.validated_data)
        return Response(
            SubscriptionSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Subscription",
        description="Returns a single subscription by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Subscription",
        description="Updates an existing subscription.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = SubscriptionService.update(instance=instance, **serializer.validated_data)
        return Response(SubscriptionSerializer(updated).data)

    @extend_schema(
        summary="Delete Subscription",
        description="Deletes a subscription.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        SubscriptionService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Subscription",
        description="Activates a deactivated subscription.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(SubscriptionSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Subscription",
        description="Deactivates an active subscription.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(SubscriptionSerializer(instance).data)
