from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.negotiations.models.negotiation import CustomerNegotiation
from apps.negotiations.serializers.negotiation_serializer import CustomerNegotiationSerializer
from apps.negotiations.services.negotiation_service import NegotiationService
from apps.negotiations.permissions import IsNegotiationParticipantOrAdmin


class CustomerNegotiationViewSet(viewsets.ModelViewSet):
    queryset = CustomerNegotiation.objects.all()
    serializer_class = CustomerNegotiationSerializer
    permission_classes = [permissions.IsAuthenticated, IsNegotiationParticipantOrAdmin]

    @action(detail=True, methods=["post"], url_path="respond")
    def respond(self, request, pk=None):
        negotiation = self.get_object()
        new_status = request.data.get("status")
        response_notes = request.data.get("response_notes", "")
        if new_status not in ["ACCEPTED", "REJECTED", "COUNTERED"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        updated = NegotiationService.respond_to_offer(negotiation, new_status, response_notes)
        return Response(self.get_serializer(updated).data)
