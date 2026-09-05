from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings as django_settings
from drf_spectacular.utils import extend_schema

from apps.login.models import Login, PasswordResetOTP
from apps.login.serializers import (
    LoginSerializer,
    LoginCreateSerializer,
    LoginUpdateSerializer,
    UserLoginRequestSerializer,
    UserLoginResponseSerializer,
    TokenRefreshRequestSerializer,
    TokenRefreshResponseSerializer,
    LogoutRequestSerializer,
    ForgotPasswordRequestSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)
from apps.signup.serializers import UserDetailSerializer
from apps.login.services import LoginService
from dealsync.pagination import StandardResultsPagination


@extend_schema(tags=["Login"])
class LoginViewSet(viewsets.ModelViewSet):
    """
    LoginViewSet manages user authentication, JWT token issuance, token refresh,
    current authenticated user profile query, and session logout.
    """
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["create", "refresh"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Login.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action == "create":
            return UserLoginRequestSerializer
        if self.action == "refresh":
            return TokenRefreshRequestSerializer
        if self.action == "logout":
            return LogoutRequestSerializer
        if self.action == "update":
            return LoginUpdateSerializer
        return LoginSerializer

    @extend_schema(
        summary="User Login & Token Issuance",
        description="Authenticates user credentials (username or email + password) and issues JWT access and refresh tokens along with user role details.",
        request=UserLoginRequestSerializer,
        responses={200: UserLoginResponseSerializer},
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = UserLoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = LoginService.authenticate_user(
            username_or_email=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        return Response(
            UserLoginResponseSerializer(result).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Refresh JWT Token",
        description="Generates a fresh JWT access token using a valid refresh token.",
        request=TokenRefreshRequestSerializer,
        responses={200: TokenRefreshResponseSerializer},
    )
    @action(detail=False, methods=["post"], url_path="refresh")
    def refresh(self, request: Request) -> Response:
        serializer = TokenRefreshRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = LoginService.refresh_access_token(serializer.validated_data["refresh"])
        return Response(
            TokenRefreshResponseSerializer(result).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Get Current User Profile & Role",
        description="Returns details, role, and profile metadata of the currently authenticated user.",
        responses={200: UserDetailSerializer},
    )
    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request: Request) -> Response:
        # Ensure user profile exists
        if not hasattr(request.user, "profile"):
            from apps.signup.models import UserProfile, UserRole
            default_role = UserRole.ADMIN if request.user.is_superuser else UserRole.CUSTOMER
            UserProfile.objects.create(user=request.user, role=default_role)

        return Response(UserDetailSerializer(request.user).data)

    @extend_schema(
        summary="User Logout",
        description="Invalidates and blacklists the provided refresh token.",
        request=LogoutRequestSerializer,
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
    )
    @action(detail=False, methods=["post"], url_path="logout")
    def logout(self, request: Request) -> Response:
        serializer = LogoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        LoginService.logout_user(serializer.validated_data["refresh"])
        return Response({"message": "Successfully logged out."})

    @extend_schema(
        summary="List Logins",
        description="Returns a paginated list of all active logins.",
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

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
        serializer = LoginUpdateSerializer(instance, data=request.data, partial=kwargs.pop("partial", False))
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

    # ── Forgot Password ────────────────────────────────────────────────────────

    @extend_schema(
        summary="Request Password Reset OTP",
        description="Sends a 6-digit OTP to the registered email address. OTP expires in 10 minutes.",
        request=ForgotPasswordRequestSerializer,
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
    )
    @action(detail=False, methods=["post"], url_path="forgot-password", permission_classes=[AllowAny])
    def forgot_password(self, request: Request) -> Response:
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()

        # Always return the same response to prevent user enumeration
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"message": "If that email is registered, you will receive an OTP shortly."},
                status=status.HTTP_200_OK,
            )

        otp = PasswordResetOTP.generate_for_user(user)

        # Send email
        try:
            send_mail(
                subject="DealFlow360 — Your Password Reset OTP",
                message=(
                    f"Hi {user.get_full_name() or user.username},\n\n"
                    f"Your 6-digit password reset OTP is:\n\n"
                    f"    {otp}\n\n"
                    f"This OTP expires in 10 minutes. Do not share it with anyone.\n\n"
                    f"If you did not request a password reset, please ignore this email.\n\n"
                    f"— DealFlow360 Security Team"
                ),
                from_email=getattr(django_settings, "DEFAULT_FROM_EMAIL", "no-reply@dealflow360.com"),
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as exc:  # pragma: no cover
            return Response(
                {"error": {"message": "Failed to send OTP email. Please try again later."}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {"message": "If that email is registered, you will receive an OTP shortly."},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Verify Password Reset OTP",
        description="Validates the 6-digit OTP sent to the user's email. Returns success if OTP is valid and not expired.",
        request=VerifyOTPSerializer,
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
    )
    @action(detail=False, methods=["post"], url_path="verify-otp", permission_classes=[AllowAny])
    def verify_otp(self, request: Request) -> Response:
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"error": {"message": "Invalid OTP or email."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not PasswordResetOTP.verify(user, otp):
            return Response(
                {"error": {"message": "Invalid or expired OTP. Please request a new one."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"message": "OTP verified. You may now reset your password."}, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Reset Password with OTP",
        description="Resets the user's password after successful OTP verification. The OTP is consumed and cannot be reused.",
        request=ResetPasswordSerializer,
        responses={200: {"type": "object", "properties": {"message": {"type": "string"}}}},
    )
    @action(detail=False, methods=["post"], url_path="reset-password", permission_classes=[AllowAny])
    def reset_password(self, request: Request) -> Response:
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"error": {"message": "Invalid OTP or email."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not PasswordResetOTP.verify(user, otp):
            return Response(
                {"error": {"message": "Invalid or expired OTP. Please request a new one."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Consume OTP & set new password
        PasswordResetOTP.mark_used(user, otp)
        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"message": "Password reset successfully. You may now log in."}, status=status.HTTP_200_OK)
