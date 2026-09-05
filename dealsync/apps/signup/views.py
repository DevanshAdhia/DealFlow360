from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from apps.signup.models import Signup
from apps.signup.serializers import (
    SignupSerializer,
    SignupCreateSerializer,
    SignupUpdateSerializer,
    UserRegistrationSerializer,
    UserRegistrationResponseSerializer,
    UserRoleInfoSerializer,
)
from apps.signup.services import SignupService
from dealsync.pagination import StandardResultsPagination


@extend_schema(tags=["Signup"])
class SignupViewSet(viewsets.ModelViewSet):
    """
    SignupViewSet manages user registration, account onboarding, role discovery,
    and legacy signup records.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["create", "register", "roles"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Signup.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ["create", "register"]:
            return UserRegistrationSerializer
        if self.action == "update":
            return SignupUpdateSerializer
        return SignupSerializer

    @extend_schema(
        summary="User Registration / Signup",
        description="Registers a new DealFlow360 user account with an assigned role (SALES_REP, SALES_MANAGER, FINANCE, ADMIN, CUSTOMER). Returns JWT access/refresh tokens for instant onboarding.",
        request=UserRegistrationSerializer,
        responses={201: UserRegistrationResponseSerializer},
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = SignupService.register_user(**serializer.validated_data)
        return Response(
            UserRegistrationResponseSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="User Registration Endpoint (Alias)",
        description="Alias endpoint for user registration and onboarding.",
        request=UserRegistrationSerializer,
        responses={201: UserRegistrationResponseSerializer},
    )
    @action(detail=False, methods=["post"], url_path="register")
    def register(self, request: Request) -> Response:
        return self.create(request)

    @extend_schema(
        summary="List DealFlow360 User Roles",
        description="Returns metadata and descriptions for all 5 DealFlow360 ecosystem user roles.",
        responses={200: UserRoleInfoSerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="roles")
    def roles(self, request: Request) -> Response:
        roles_data = SignupService.get_available_roles()
        return Response(UserRoleInfoSerializer(roles_data, many=True).data)

    @extend_schema(
        summary="List Signups",
        description="Returns a paginated list of all active signups.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

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
        serializer = SignupUpdateSerializer(instance, data=request.data, partial=kwargs.pop("partial", False))
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
