from rest_framework import serializers
from apps.customer.models import Customer, CustomerTier


class CustomerTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTier
        fields = ["id", "name", "max_discount_percent", "is_active", "created_at"]


class CustomerSerializer(serializers.ModelSerializer):
    tier_name = serializers.CharField(source="customer_tier.name", read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id", "customer_code", "name", "customer_tier", "tier_name",
            "email", "phone", "address", "description",
            "is_active", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CustomerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["customer_code", "name", "customer_tier", "email", "phone", "address", "description"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class CustomerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["customer_code", "name", "customer_tier", "email", "phone", "address", "description", "is_active"]
