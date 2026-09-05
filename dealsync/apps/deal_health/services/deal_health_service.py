from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from apps.deal_health.models.deal_health import DealAlert
from apps.sales.models import Quotation


class DealHealthService:
    @staticmethod
    @transaction.atomic
    def create_alert(quotation_id, alert_type: str, severity: str, title: str, details: str = "") -> DealAlert:
        return DealAlert.objects.create(
            quotation_id=quotation_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            details=details,
        )

    @staticmethod
    @transaction.atomic
    def resolve_alert(alert: DealAlert) -> DealAlert:
        alert.is_resolved = True
        alert.resolved_at = timezone.now()
        alert.save()
        return alert

    @staticmethod
    @transaction.atomic
    def scan_stalled_deals() -> int:
        """
        Scans for quotations in SUBMITTED/PENDING status unchanged for > 7 days.
        Creates DealAlert if not already present.
        """
        stale_threshold = timezone.now() - timedelta(days=7)
        stalled_quotes = Quotation.objects.filter(
            status__in=["SUBMITTED", "PENDING"],
            updated_at__lte=stale_threshold
        )

        alerts_created = 0
        for quote in stalled_quotes:
            exists = DealAlert.objects.filter(quotation=quote, alert_type="STALLED_DEAL", is_resolved=False).exists()
            if not exists:
                DealHealthService.create_alert(
                    quotation_id=quote.id,
                    alert_type="STALLED_DEAL",
                    severity="HIGH",
                    title=f"Quotation {quote.quotation_number} is Stalled",
                    details=f"No updates received for quote {quote.quotation_number} since {quote.updated_at.strftime('%Y-%m-%d')}."
                )
                alerts_created += 1

        return alerts_created
