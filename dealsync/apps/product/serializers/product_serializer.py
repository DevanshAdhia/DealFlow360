from rest_framework import serializers
from apps.product.models import Product, Category, PriceList, PriceListItem, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "is_active", "status", "created_at"]

    def get_status(self, obj) -> str:
        return "Active" if getattr(obj, "is_active", True) else "Inactive"


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id", "sku", "name", "category", "category_name", "product_type",
            "sales_price", "cost_price", "tax_percent", "description",
            "is_active", "status", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_status(self, obj) -> str:
        return "Active" if getattr(obj, "is_active", True) else "Inactive"


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["name", "sku", "category", "product_type", "sales_price", "cost_price", "tax_percent", "description", "is_active"]

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value.strip()


class ProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["name", "sku", "category", "product_type", "sales_price", "cost_price", "tax_percent", "description", "is_active"]


class PriceListSerializer(serializers.ModelSerializer):
    customer_tier_name = serializers.CharField(source="customer_tier.name", read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = PriceList
        fields = ["id", "name", "customer_tier", "customer_tier_name", "currency", "is_active", "status", "created_at"]

    def get_status(self, obj) -> str:
        return "Active" if getattr(obj, "is_active", True) else "Inactive"
