import logging
import uuid
from decimal import Decimal
from datetime import datetime
from typing import Any, List, Dict, Optional
from django.db import transaction
from apps.sales.models import (
    Quotation,
    QuotationItem,
    QuotationVersion,
    QuotationStatus,
    ApprovalStatus,
)
from apps.discount.services.risk_engine import RiskEngine

logger = logging.getLogger(__name__)


class SalesService:
    """
    SalesService isolates core domain business logic, financial computations, risk routing,
    and versioning workflows from REST views and DRF serializers.
    """

    @staticmethod
    def recalculate_quotation(quotation: Quotation) -> Quotation:
        """
        Authoritatively calculates line item financials, totals, margins, and risk score.
        """
        items = list(QuotationItem.objects.filter(quotation=quotation))
        
        q_subtotal = Decimal("0.00")
        q_discount_amount = Decimal("0.00")
        q_tax_amount = Decimal("0.00")
        q_total_amount = Decimal("0.00")
        q_cost_amount = Decimal("0.00")
        
        for item in items:
            qty = Decimal(str(item.quantity))
            price = Decimal(str(item.unit_price))
            disc_pct = Decimal(str(item.discount_percent))
            tax_pct = Decimal(str(item.tax_percent))
            cost = Decimal(str(item.cost_price))

            subtotal = price * qty
            discount_amount = subtotal * (disc_pct / Decimal("100.00"))
            taxable = subtotal - discount_amount
            tax_amount = taxable * (tax_pct / Decimal("100.00"))
            total_amount = taxable + tax_amount
            cost_amount = cost * qty
            margin_amount = taxable - cost_amount
            margin_percent = (margin_amount / taxable * Decimal("100.00")) if taxable > 0 else Decimal("0.00")

            item.subtotal = round(subtotal, 2)
            item.discount_amount = round(discount_amount, 2)
            item.tax_amount = round(tax_amount, 2)
            item.total_amount = round(total_amount, 2)
            item.cost_amount = round(cost_amount, 2)
            item.margin_amount = round(margin_amount, 2)
            item.margin_percent = round(margin_percent, 2)
            item.save()

            q_subtotal += item.subtotal
            q_discount_amount += item.discount_amount
            q_tax_amount += item.tax_amount
            q_total_amount += item.total_amount
            q_cost_amount += item.cost_amount

        net_sales = q_subtotal - q_discount_amount
        q_margin_amount = net_sales - q_cost_amount
        q_margin_percent = (q_margin_amount / net_sales * Decimal("100.00")) if net_sales > 0 else Decimal("0.00")

        quotation.subtotal = round(q_subtotal, 2)
        quotation.discount_amount = round(q_discount_amount, 2)
        quotation.tax_amount = round(q_tax_amount, 2)
        quotation.total_amount = round(q_total_amount, 2)
        quotation.cost_amount = round(q_cost_amount, 2)
        quotation.margin_amount = round(q_margin_amount, 2)
        quotation.margin_percent = round(q_margin_percent, 2)
        
        # Calculate Risk using RiskEngine
        risk_score = RiskEngine.calculate_risk(quotation)
        quotation.blended_risk_score = Decimal(str(risk_score))
        quotation.save()

        logger.info("Recalculated Quotation id=%s total=%s margin_pct=%s risk=%s", quotation.pk, quotation.total_amount, quotation.margin_percent, quotation.blended_risk_score)
        return quotation

    @classmethod
    @transaction.atomic
    def create_quotation(
        cls,
        customer=None,
        sales_rep=None,
        currency: str = "INR",
        valid_until: Optional[Any] = None,
        notes: str = "",
        items: Optional[List[Dict[str, Any]]] = None,
    ) -> Quotation:
        quotation_number = f"QT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        quotation = Quotation.objects.create(
            quotation_number=quotation_number,
            customer=customer if hasattr(customer, "id") else None,
            sales_rep=sales_rep if hasattr(sales_rep, "id") else None,
            currency=currency,
            valid_until=valid_until,
            notes=notes,
            status=QuotationStatus.DRAFT,
            approval_status=ApprovalStatus.NOT_REQUIRED,
        )

        if items:
            for item_data in items:
                QuotationItem.objects.create(
                    quotation=quotation,
                    product=item_data.get("product"),
                    variant=item_data.get("variant"),
                    product_name=item_data.get("product_name", "Product"),
                    quantity=item_data.get("quantity", 1),
                    unit_price=Decimal(str(item_data.get("unit_price", 0))),
                    discount_percent=Decimal(str(item_data.get("discount_percent", 0))),
                    tax_percent=Decimal(str(item_data.get("tax_percent", 18.00))),
                    cost_price=Decimal(str(item_data.get("cost_price", 0))),
                )

        cls.recalculate_quotation(quotation)
        cls.create_version_snapshot(quotation, changed_by=sales_rep, change_reason="Initial Quotation Creation")
        return quotation

    @classmethod
    @transaction.atomic
    def update_quotation(cls, quotation: Quotation, changed_by=None, **kwargs: Any) -> Quotation:
        for field, value in kwargs.items():
            if hasattr(quotation, field):
                setattr(quotation, field, value)
        quotation.save()
        cls.recalculate_quotation(quotation)
        cls.create_version_snapshot(quotation, changed_by=changed_by, change_reason="Quotation metadata update")
        return quotation

    @classmethod
    @transaction.atomic
    def add_item(cls, quotation: Quotation, item_data: Dict[str, Any], changed_by=None) -> QuotationItem:
        item = QuotationItem.objects.create(
            quotation=quotation,
            product=item_data.get("product"),
            variant=item_data.get("variant"),
            product_name=item_data.get("product_name", "Product"),
            quantity=item_data.get("quantity", 1),
            unit_price=Decimal(str(item_data.get("unit_price", 0))),
            discount_percent=Decimal(str(item_data.get("discount_percent", 0))),
            tax_percent=Decimal(str(item_data.get("tax_percent", 18.00))),
            cost_price=Decimal(str(item_data.get("cost_price", 0))),
        )
        cls.recalculate_quotation(quotation)
        cls.create_version_snapshot(quotation, changed_by=changed_by, change_reason=f"Added item {item.product_name}")
        return item

    @classmethod
    @transaction.atomic
    def update_item(cls, item: QuotationItem, item_data: Dict[str, Any], changed_by=None) -> QuotationItem:
        for field in ["quantity", "unit_price", "discount_percent", "tax_percent", "cost_price", "product_name", "product", "variant"]:
            if field in item_data:
                setattr(item, field, item_data[field])
        item.save()
        cls.recalculate_quotation(item.quotation)
        cls.create_version_snapshot(item.quotation, changed_by=changed_by, change_reason=f"Updated item {item.product_name}")
        return item

    @classmethod
    @transaction.atomic
    def delete_item(cls, item: QuotationItem, changed_by=None) -> None:
        quotation = item.quotation
        product_name = item.product_name
        item.delete()
        cls.recalculate_quotation(quotation)
        cls.create_version_snapshot(quotation, changed_by=changed_by, change_reason=f"Deleted item {product_name}")

    @classmethod
    @transaction.atomic
    def submit_quotation(cls, quotation: Quotation, changed_by=None) -> Quotation:
        quotation.status = QuotationStatus.SUBMITTED
        
        # Evaluate risk level using RiskEngine rules
        risk_level = RiskEngine.evaluate_risk_level(quotation)
        
        # HIGH and MEDIUM risk require manual approval by the sales team/manager
        if risk_level in ["HIGH", "MEDIUM"]:
            quotation.approval_status = ApprovalStatus.PENDING
        else:
            quotation.approval_status = ApprovalStatus.APPROVED
            
        quotation.save()
        cls.create_version_snapshot(quotation, changed_by=changed_by, change_reason=f"Submitted Quotation (Risk Level: {risk_level})")
        return quotation

    @classmethod
    @transaction.atomic
    def send_quotation(cls, quotation: Quotation, changed_by=None) -> Quotation:
        quotation.status = QuotationStatus.SENT
        quotation.save()
        cls.create_version_snapshot(quotation, changed_by=changed_by, change_reason="Sent Quotation to Customer")
        return quotation

    @staticmethod
    def create_version_snapshot(quotation: Quotation, changed_by=None, change_reason: str = "") -> QuotationVersion:
        # Lock quotation row using select_for_update to prevent version sequence race conditions
        locked_quote = Quotation.objects.select_for_update().get(pk=quotation.pk)
        last_version = locked_quote.versions.order_by("-version_number").first()
        next_ver = (last_version.version_number + 1) if last_version else 1
        
        items_snapshot = [
            {
                "id": str(item.id),
                "product_id": item.product_id if hasattr(item, "product_id") else None,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": str(item.unit_price),
                "discount_percent": str(item.discount_percent),
                "tax_percent": str(item.tax_percent),
                "total_amount": str(item.total_amount),
                "margin_amount": str(item.margin_amount),
            }
            for item in quotation.items.all()
        ]

        snapshot_data = {
            "quotation_number": quotation.quotation_number,
            "customer_id": quotation.customer_id if hasattr(quotation, "customer_id") else None,
            "sales_rep_id": quotation.sales_rep_id if hasattr(quotation, "sales_rep_id") else None,
            "status": quotation.status,
            "approval_status": quotation.approval_status,
            "totals": {
                "subtotal": str(quotation.subtotal),
                "discount_amount": str(quotation.discount_amount),
                "tax_amount": str(quotation.tax_amount),
                "total_amount": str(quotation.total_amount),
                "margin_amount": str(quotation.margin_amount),
                "margin_percent": str(quotation.margin_percent),
                "blended_risk_score": str(quotation.blended_risk_score),
            },
            "items": items_snapshot,
        }

        user_instance = changed_by if hasattr(changed_by, "pk") else None
        version = QuotationVersion.objects.create(
            quotation=quotation,
            version_number=next_ver,
            snapshot_data=snapshot_data,
            changed_by=user_instance,
            change_reason=change_reason,
        )
        return version

    @staticmethod
    def delete(instance: Quotation) -> None:
        instance.delete()

    @staticmethod
    def soft_delete(instance: Quotation) -> Quotation:
        instance.deactivate()
        return instance
