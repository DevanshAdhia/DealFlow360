import logging
from typing import Any, Optional
from django.db import transaction
from apps.subscription.models import Subscription

logger = logging.getLogger(__name__)


class SubscriptionService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Subscription:
        """Create a new subscription instance."""
        instance = Subscription.objects.create(
            name=name,
            description=description,
        )
        logger.info("Subscription created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Subscription, **kwargs: Any) -> Subscription:
        """Update an existing subscription instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Subscription updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Subscription) -> None:
        """Hard-delete a subscription instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Subscription deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Subscription) -> Subscription:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Subscription deactivated: id=%s", instance.pk)
        return instance
