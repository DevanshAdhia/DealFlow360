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
    username = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6, required=False, default="Pass123456!")
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    name = serializers.CharField(max_length=300, required=False, allow_blank=True, default="")
    role = serializers.CharField(required=False, default=UserRole.CUSTOMER)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    company = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")
    department = serializers.CharField(max_length=128, required=False, allow_blank=True, default="")
    status = serializers.CharField(required=False, default="Active")

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return email

    def validate_username(self, value: str) -> str:
        if not value:
            return ""
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return username

    def validate_role(self, value: str) -> str:
        val_upper = value.upper().replace(" ", "_")
        valid_roles = [r[0] for r in UserRole.choices]
        # Also map frontend display roles
        role_map = {
            "ADMIN": UserRole.ADMIN,
            "SALES_MANAGER": UserRole.SALES_MANAGER,
            "SALES_REPRESENTATIVE": UserRole.SALES_REP,
            "SALES_REP": UserRole.SALES_REP,
            "FINANCE": UserRole.FINANCE,
            "OPERATIONS": UserRole.FINANCE,
            "CUSTOMER": UserRole.CUSTOMER,
        }
        mapped = role_map.get(val_upper, None)
        if not mapped and val_upper in valid_roles:
            mapped = val_upper
        if not mapped:
            raise serializers.ValidationError(f"Invalid role '{value}'. Must be one of: Admin, Sales Manager, Sales Representative, Finance, Customer.")
        return mapped


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["role", "role_display", "phone", "company", "is_active", "created_at"]


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "name", "role", "department", "status", "is_active", "profile"]

    def get_name(self, obj) -> str:
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full if full else obj.username

    def get_department(self, obj) -> str:
        if hasattr(obj, "profile") and obj.profile and obj.profile.company:
            return obj.profile.company
        return "Sales"

    def get_role(self, obj) -> str:
        if hasattr(obj, "profile") and obj.profile:
            role_display_map = {
                UserRole.ADMIN: "Admin",
                UserRole.SALES_MANAGER: "Sales Manager",
                UserRole.SALES_REP: "Sales Representative",
                UserRole.FINANCE: "Finance",
                UserRole.CUSTOMER: "Customer",
            }
            return role_display_map.get(obj.profile.role, obj.profile.get_role_display())
        return "Sales Representative"

    def get_status(self, obj) -> str:
        is_act = getattr(getattr(obj, "profile", None), "is_active", obj.is_active)
        return "Active" if is_act else "Inactive"


class UserRegistrationResponseSerializer(serializers.Serializer):
    user = UserDetailSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()


class UserRoleInfoSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()

