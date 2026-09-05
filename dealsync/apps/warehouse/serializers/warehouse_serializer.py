from rest_framework import serializers
from apps.warehouse.models import Warehouse, Inventory, Order, OrderItem, FulfillmentOrder


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "location_code", "name", "address", "description", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class InventorySerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id", "warehouse", "warehouse_name", "product", "product_name", "product_sku",
            "variant", "quantity_on_hand", "quantity_reserved", "available_to_allocate"
        ]


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    quotation_number = serializers.CharField(source="quotation.quotation_number", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "quotation", "quotation_number", "customer", "customer_name",
            "status", "order_date", "total_amount"
        ]


class WarehouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["location_code", "name", "address", "description"]


class WarehouseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["location_code", "name", "address", "description", "is_active"]
