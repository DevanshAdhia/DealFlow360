from rest_framework import serializers
from apps.signup.models import Signup


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
