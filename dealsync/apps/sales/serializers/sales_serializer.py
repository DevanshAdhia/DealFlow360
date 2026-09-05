from datetime import date
from decimal import Decimal
from rest_framework import serializers
from apps.sales.models import Quotation, QuotationItem, QuotationVersion


# ============================================================================
# Line Item & Version Serializers
# ============================================================================

class QuotationItemCreateSerializer(serializers.Serializer):
    """
    Serializer used for validating input payloads when adding a new line item.
    """
    product_id = serializers.CharField(max_length=128)
    product_name = serializers.CharField(max_length=255)
    quantity = serializers.IntegerField(min_value=1, default=1)
    unit_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.00"))
    discount_percent = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("0.00"), max_value=Decimal("100.00"), default=Decimal("0.00"))
    tax_percent = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("0.00"), max_value=Decimal("100.00"), default=Decimal("0.00"))
    cost_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.00"), default=Decimal("0.00"))

    def validate_quantity(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate_discount_percent(self, value: Decimal) -> Decimal:
        if value < Decimal("0.00") or value > Decimal("100.00"):
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")
        return value


class QuotationItemSerializer(serializers.ModelSerializer):
    """
    ModelSerializer is used because line item outputs map directly to writable Django model fields
    and benefit from DRF's model-aware serialization and field typing.
    """
    class Meta:
        model = QuotationItem
        fields = [
            "id",
            "quotation",
            "product_id",
            "product_name",
            "quantity",
            "unit_price",
            "discount_percent",
            "subtotal",
            "discount_amount",
            "tax_percent",
            "tax_amount",
            "total_amount",
            "cost_price",
            "cost_amount",
            "margin_amount",
            "margin_percent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "quotation",
            "subtotal",
            "discount_amount",
            "tax_amount",
            "total_amount",
            "cost_amount",
            "margin_amount",
            "margin_percent",
            "created_at",
            "updated_at",
        ]


class QuotationItemUpdateSerializer(serializers.Serializer):
    """
    Serializer used for validating input payloads when updating an existing line item.
    Fields are optional to support partial updates.
    """
    product_id = serializers.CharField(max_length=128, required=False)
    product_name = serializers.CharField(max_length=255, required=False)
    quantity = serializers.IntegerField(min_value=1, required=False)
    unit_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.00"), required=False)
    discount_percent = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("0.00"), max_value=Decimal("100.00"), required=False)
    tax_percent = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("0.00"), max_value=Decimal("100.00"), required=False)
    cost_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal("0.00"), required=False)

    def validate_quantity(self, value: int) -> int:
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate_discount_percent(self, value: Decimal) -> Decimal:
        if value < Decimal("0.00") or value > Decimal("100.00"):
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")
        return value


class QuotationVersionSerializer(serializers.ModelSerializer):
    """
    ModelSerializer is used to expose audit snapshot version history records safely as read-only objects.
    """
    class Meta:
        model = QuotationVersion
        fields = [
            "id",
            "quotation",
            "version_number",
            "snapshot_data",
            "changed_by",
            "changed_at",
            "change_reason",
        ]
        read_only_fields = ["id", "quotation", "version_number", "snapshot_data", "changed_at"]


# ============================================================================
# Main Quotation Serializers (Lifecycle Order: Create -> List/Detail -> Update)
# ============================================================================

class QuotationCreateSerializer(serializers.Serializer):
    """
    A plain Serializer is used for creation commands because payload structure contains a mix
    of quotation metadata and inline nested item commands that require transactional processing.
    """
    customer_id = serializers.CharField(max_length=128)
    sales_rep_id = serializers.CharField(max_length=128)
    currency = serializers.CharField(max_length=10, default="INR")
    valid_until = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = QuotationItemCreateSerializer(many=True, required=False, default=list)

    def validate_valid_until(self, value: date) -> date:
        if value and value < date.today():
            raise serializers.ValidationError("Valid until date cannot be in the past.")
        return value


class QuotationSerializer(serializers.ModelSerializer):
    """
    The detail ModelSerializer is optimized for response representation, exposing nested line items
    and version history counts without exposing writable internal state directly.
    """
    items = QuotationItemSerializer(many=True, read_only=True)
    versions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = [
            "id",
            "quotation_number",
            "customer_id",
            "sales_rep_id",
            "status",
            "approval_status",
            "valid_until",
            "currency",
            "notes",
            "subtotal",
            "discount_amount",
            "tax_amount",
            "total_amount",
            "cost_amount",
            "margin_amount",
            "margin_percent",
            "blended_risk_score",
            "items",
            "versions_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "quotation_number",
            "status",
            "approval_status",
            "subtotal",
            "discount_amount",
            "tax_amount",
            "total_amount",
            "cost_amount",
            "margin_amount",
            "margin_percent",
            "blended_risk_score",
            "created_at",
            "updated_at",
        ]

    def get_versions_count(self, obj: Quotation) -> int:
        """Prefetched count avoiding N+1 database queries."""
        if hasattr(obj, "prefetched_versions"):
            return len(obj.prefetched_versions)
        return obj.versions.count()


class QuotationUpdateSerializer(serializers.Serializer):
    """
    A dedicated update serializer is used because metadata updates accept partial fields
    that differ from creation payloads and response representations.
    """
    currency = serializers.CharField(max_length=10, required=False)
    valid_until = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_valid_until(self, value: date) -> date:
        if value and value < date.today():
            raise serializers.ValidationError("Valid until date cannot be in the past.")
        return value
