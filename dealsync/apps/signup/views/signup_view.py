from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.signup.models import Signup
from apps.signup.serializers import SignupSerializer, SignupCreateSerializer, SignupUpdateSerializer
from apps.signup.services import SignupService
from common.pagination import StandardResultsPagination
from common.responses import success_response, error_response


@extend_schema(tags=["Signup"])
class SignupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Signup.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return SignupCreateSerializer
        if self.action in ["update", "partial_update"]:
            return SignupUpdateSerializer
        return SignupSerializer

    @extend_schema(
        summary="List Signups",
        description="Returns a paginated list of all active signups.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Signup",
        description="Creates a new signup.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = SignupService.create(**serializer.validated_data)
        return Response(
            SignupSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Signup",
        description="Returns a single signup by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Signup",
        description="Updates an existing signup.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = SignupService.update(instance=instance, **serializer.validated_data)
        return Response(SignupSerializer(updated).data)

    @extend_schema(
        summary="Delete Signup",
        description="Deletes a signup.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        SignupService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Signup",
        description="Activates a deactivated signup.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(SignupSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Signup",
        description="Deactivates an active signup.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(SignupSerializer(instance).data)
