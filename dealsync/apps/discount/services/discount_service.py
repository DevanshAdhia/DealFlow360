import logging
from typing import Any, Optional
from django.db import transaction
from apps.discount.models import Discount

logger = logging.getLogger(__name__)


class DiscountService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Discount:
        """Create a new discount instance."""
        instance = Discount.objects.create(
            name=name,
            description=description,
        )
        logger.info("Discount created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Discount, **kwargs: Any) -> Discount:
        """Update an existing discount instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Discount updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Discount) -> None:
        """Hard-delete a discount instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Discount deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Discount) -> Discount:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Discount deactivated: id=%s", instance.pk)
        return instance
