from rest_framework import serializers
from django.contrib.auth.models import User
from apps.signup.models import Signup, UserProfile, UserRole


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signup
        fields = ["id", "name", "description", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class SignupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signup
        fields = ["name", "description"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class SignupUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signup
        fields = ["name", "description", "is_active"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.CUSTOMER)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    company = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")

    def validate_username(self, value: str) -> str:
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["role", "role_display", "phone", "company", "is_active", "created_at"]


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "profile"]


class UserRegistrationResponseSerializer(serializers.Serializer):
    user = UserDetailSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()


class UserRoleInfoSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
