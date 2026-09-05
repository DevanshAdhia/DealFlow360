from rest_framework import serializers
from apps.negotiations.models.negotiation import CustomerNegotiation


class CustomerNegotiationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerNegotiation
        fields = [
            "id",
            "quotation",
            "counter_price",
            "customer_notes",
            "status",
            "submitted_at",
            "responded_at",
            "response_notes",
        ]
        read_only_fields = ["id", "status", "submitted_at", "responded_at"]
