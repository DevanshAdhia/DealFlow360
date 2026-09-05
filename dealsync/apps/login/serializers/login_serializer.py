from rest_framework import serializers
from apps.login.models import Login
from apps.signup.serializers import UserDetailSerializer


class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = ["id", "name", "description", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class LoginCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = ["name", "description"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class LoginUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = ["name", "description", "is_active"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class UserLoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField(help_text="Username or registered email address")
    password = serializers.CharField(write_only=True)


class UserLoginResponseSerializer(serializers.Serializer):
    user = UserDetailSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()


class TokenRefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class TokenRefreshResponseSerializer(serializers.Serializer):
    access = serializers.CharField()


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="Refresh token to blacklist")


# ── Forgot Password ────────────────────────────────────────────────────────────

class ForgotPasswordRequestSerializer(serializers.Serializer):
    """Step 1: User submits their email; backend sends a 6-digit OTP."""
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    """Step 2: User submits email + 6-digit OTP to confirm identity."""
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Step 3: User submits email + OTP + new password to complete reset."""
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(
        min_length=8,
        write_only=True,
        help_text="New password (min 8 characters)",
    )
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
