import logging
from typing import Any, Dict, List
from django.db import transaction
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from apps.signup.models import SignupAudit, UserProfile, UserRole

logger = logging.getLogger(__name__)


ROLE_DESCRIPTIONS = {
    UserRole.SALES_REP: "Internal Sales Representative: Builds quotations, tracks pipeline deals, applies allowed line item discounts.",
    UserRole.SALES_MANAGER: "Sales Manager / Approver: Oversees team pipeline, reviews & approves/rejects quotations, manages escalations.",
    UserRole.FINANCE: "Finance / Operations: Performs final approvals on high-risk/high-margin quotes, handles billing, invoices & stock fulfillment.",
    UserRole.ADMIN: "System Administrator: System owner with full administrative access to users, roles, product catalog, discount rules & system settings.",
    UserRole.CUSTOMER: "External Customer: Restricted buyer portal access to view shared quotes, submit counter-offers, and track orders.",
}


class SignupService:

    @staticmethod
    @transaction.atomic
    def register_user(
        username: str,
        email: str,
        password: str,
        first_name: str = "",
        last_name: str = "",
        role: str = UserRole.SALES_REP,
        phone: str = "",
        company: str = "",
        ip_address: str = None,
    ) -> Dict[str, Any]:
        """
        transaction.atomic() guarantees User creation, UserProfile association,
        SignupAudit log creation, and initial JWT token generation succeed atomically.
        """
        if role in [UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES_MANAGER]:
            raise ValueError("Self-registration for administrative roles (ADMIN, FINANCE, SALES_MANAGER) is prohibited.")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        UserProfile.objects.create(
            user=user,
            role=role,
            phone=phone,
            company=company,
        )

        SignupAudit.objects.create(
            user=user,
            username=username,
            email=email,
            role=role,
            ip_address=ip_address,
        )

        refresh = RefreshToken.for_user(user)

        logger.info("User registered successfully: username=%s role=%s", user.username, role)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def get_available_roles() -> List[Dict[str, str]]:
        """Returns metadata for all 5 DealFlow360 roles."""
        return [
            {
                "code": role_code,
                "name": str(role_label),
                "description": ROLE_DESCRIPTIONS.get(role_code, str(role_label)),
            }
            for role_code, role_label in UserRole.choices
        ]

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> SignupAudit:
        """Create a new signup audit instance."""
        user, _ = User.objects.get_or_create(username=name, defaults={"email": f"{name}@example.com"})
        instance = SignupAudit.objects.create(
            user=user,
            username=name,
            email=user.email,
            role=UserRole.CUSTOMER,
        )
        logger.info("Signup audit created: id=%s username=%s", instance.pk, instance.username)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: SignupAudit, **kwargs: Any) -> SignupAudit:
        """Update an existing signup audit instance."""
        for field, value in kwargs.items():
            if hasattr(instance, field):
                setattr(instance, field, value)
        instance.save()
        logger.info("Signup audit updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: SignupAudit) -> None:
        """Hard-delete a signup audit instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Signup audit deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: SignupAudit) -> SignupAudit:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Signup audit deactivated: id=%s", instance.pk)
        return instance
