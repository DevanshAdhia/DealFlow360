from rest_framework import viewsets, permissions
from apps.reports.models.report import GeneratedReport
from apps.reports.serializers.report_serializer import GeneratedReportSerializer
from apps.reports.permissions import CanGenerateReports


class GeneratedReportViewSet(viewsets.ModelViewSet):
    queryset = GeneratedReport.objects.all()
    serializer_class = GeneratedReportSerializer
    permission_classes = [permissions.IsAuthenticated, CanGenerateReports]

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)
