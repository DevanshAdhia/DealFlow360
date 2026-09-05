from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.deal_health.models.deal_health import DealAlert
from apps.deal_health.serializers.deal_health_serializer import DealAlertSerializer
from apps.deal_health.services.deal_health_service import DealHealthService
from apps.deal_health.permissions import IsDealHealthManager


class DealAlertViewSet(viewsets.ModelViewSet):
    queryset = DealAlert.objects.all()
    serializer_class = DealAlertSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        alert = self.get_object()
        resolved = DealHealthService.resolve_alert(alert)
        return Response(self.get_serializer(resolved).data)
