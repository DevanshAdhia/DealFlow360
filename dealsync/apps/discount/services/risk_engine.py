from decimal import Decimal
import logging
from apps.discount.models import DiscountRule, ApprovalRule, ApprovalLevel

logger = logging.getLogger(__name__)


class RiskEngine:
    DEFAULT_GST_PERCENT = Decimal("18.00")
    DEFAULT_DISCOUNT_PERCENT = Decimal("15.00")

    TIER_HIGH_RISK_THRESHOLDS = {
        "GOLD": Decimal("10.00"),
        "PLATINUM": Decimal("15.00"),
        "ENTERPRISE": Decimal("20.00"),
    }

    @classmethod
    def evaluate_risk_level(cls, quotation) -> str:
        """
        Evaluates quotation risk level: 'LOW', 'MEDIUM', or 'HIGH'.
        
        Rules:
        - GST: 18% default
        - Base Discount Rule:
          * < 15%: LOW Risk
          * 15% - 17%: MEDIUM Risk
          * > 17%: HIGH Risk
        - Customer Tier High-Risk Overrides:
          * Gold Member: > 10% discount is HIGH Risk
          * Platinum Member: > 15% discount is HIGH Risk
          * Enterprise Member: > 20% discount is HIGH Risk
        """
        subtotal = Decimal(str(quotation.subtotal or "0.00"))
        discount_amount = Decimal(str(quotation.discount_amount or "0.00"))

        if subtotal > Decimal("0.00"):
            effective_discount_pct = (discount_amount / subtotal) * Decimal("100.00")
        else:
            items = list(quotation.items.all())
            effective_discount_pct = max([Decimal(str(item.discount_percent)) for item in items], default=Decimal("0.00"))

        customer_tier = getattr(quotation.customer, "customer_tier", None) if quotation.customer else None
        tier_name = (customer_tier.name or "").upper() if customer_tier else ""

        # Check Tier-specific High Risk Threshold
        if "GOLD" in tier_name:
            if effective_discount_pct > cls.TIER_HIGH_RISK_THRESHOLDS["GOLD"]:
                return "HIGH"
        elif "PLATINUM" in tier_name:
            if effective_discount_pct > cls.TIER_HIGH_RISK_THRESHOLDS["PLATINUM"]:
                return "HIGH"
        elif "ENTERPRISE" in tier_name:
            if effective_discount_pct > cls.TIER_HIGH_RISK_THRESHOLDS["ENTERPRISE"]:
                return "HIGH"

        # General Discount Risk Thresholds
        if effective_discount_pct < Decimal("15.00"):
            return "LOW"
        elif Decimal("15.00") <= effective_discount_pct <= Decimal("17.00"):
            return "MEDIUM"
        else:
            return "HIGH"

    @classmethod
    def calculate_risk(cls, quotation) -> int:
        """
        Calculates numeric Risk Score (0-100) based on evaluated risk level and factors.
        """
        risk_level = cls.evaluate_risk_level(quotation)
        if risk_level == "HIGH":
            return 75
        elif risk_level == "MEDIUM":
            return 40
        else:
            return 10

    @staticmethod
    def get_required_approval_levels(risk_score: int):
        """
        Returns list of ApprovalLevel instances required for a given risk score.
        """
        rule = ApprovalRule.objects.filter(
            min_risk_score__lte=risk_score,
            max_risk_score__gte=risk_score
        ).prefetch_related("steps__approval_level").first()

        if not rule:
            if risk_score >= 30:
                level = ApprovalLevel.objects.filter(sequence=1).first()
                return [level] if level else []
            return []

        return [step.approval_level for step in rule.steps.all()]
