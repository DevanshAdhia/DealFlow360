from rest_framework import serializers
from apps.login.models import Login


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
