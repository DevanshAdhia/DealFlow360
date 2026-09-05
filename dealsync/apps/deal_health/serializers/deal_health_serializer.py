from rest_framework import serializers
from apps.deal_health.models.deal_health import DealAlert


class DealAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealAlert
        fields = [
            "id",
            "quotation",
            "alert_type",
            "severity",
            "title",
            "details",
            "is_resolved",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = ["id", "created_at", "resolved_at"]
