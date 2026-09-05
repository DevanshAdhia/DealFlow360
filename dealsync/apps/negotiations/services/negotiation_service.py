from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from apps.negotiations.models.negotiation import CustomerNegotiation
from apps.sales.services.sales_service import SalesService


class NegotiationService:
    @staticmethod
    @transaction.atomic
    def submit_counter_offer(quotation_id, counter_price, notes: str = "") -> CustomerNegotiation:
        negotiation = CustomerNegotiation.objects.create(
            quotation_id=quotation_id,
            counter_price=Decimal(str(counter_price)),
            customer_notes=notes,
            status="PENDING",
        )
        return negotiation

    @staticmethod
    @transaction.atomic
    def respond_to_offer(negotiation: CustomerNegotiation, status: str, response_notes: str = "") -> CustomerNegotiation:
        negotiation.status = status
        negotiation.response_notes = response_notes
        negotiation.responded_at = timezone.now()
        negotiation.save()

        if status == "ACCEPTED":
            quotation = negotiation.quotation
            old_total = Decimal(str(quotation.total_amount))
            new_price = Decimal(str(negotiation.counter_price))

            # If material price change (> 5% reduction), require re-approval
            if old_total > 0 and ((old_total - new_price) / old_total) > Decimal("0.05"):
                quotation.approval_status = "PENDING"
                quotation.status = "SUBMITTED"

            quotation.total_amount = new_price
            quotation.save()

            SalesService.recalculate_quotation(quotation)
            SalesService.create_version_snapshot(
                quotation,
                change_reason=f"Accepted Customer Counter-Offer of {new_price}"
            )

        return negotiation
