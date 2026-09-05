from rest_framework import serializers
from apps.reports.models.report import GeneratedReport


class GeneratedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedReport
        fields = [
            "id",
            "report_type",
            "file",
            "parameters",
            "generated_by",
            "created_at",
        ]
        read_only_fields = ["id", "file", "generated_by", "created_at"]
