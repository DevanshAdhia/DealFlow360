from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.login.models import Login
from apps.login.serializers import LoginSerializer, LoginCreateSerializer, LoginUpdateSerializer
from apps.login.services import LoginService
from dealsync.pagination import StandardResultsPagination
from dealsync.responses import success_response, error_response


@extend_schema(tags=["Login"])
class LoginViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Login.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return LoginCreateSerializer
        if self.action in ["update", "partial_update"]:
            return LoginUpdateSerializer
        return LoginSerializer

    @extend_schema(
        summary="List Logins",
        description="Returns a paginated list of all active logins.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Login",
        description="Creates a new login.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = LoginService.create(**serializer.validated_data)
        return Response(
            LoginSerializer(instance).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Login",
        description="Returns a single login by ID.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Login",
        description="Updates an existing login.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        updated = LoginService.update(instance=instance, **serializer.validated_data)
        return Response(LoginSerializer(updated).data)

    @extend_schema(
        summary="Delete Login",
        description="Deletes a login.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        LoginService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Activate Login",
        description="Activates a deactivated login.",
    )
    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.activate()
        return Response(LoginSerializer(instance).data)

    @extend_schema(
        summary="Deactivate Login",
        description="Deactivates an active login.",
    )
    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request: Request, pk=None) -> Response:
        instance = self.get_object()
        instance.deactivate()
        return Response(LoginSerializer(instance).data)
