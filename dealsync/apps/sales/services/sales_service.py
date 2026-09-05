import logging
from typing import Any, Optional
from django.db import transaction
from apps.sales.models import Sales

logger = logging.getLogger(__name__)


class SalesService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Sales:
        """Create a new sales instance."""
        instance = Sales.objects.create(
            name=name,
            description=description,
        )
        logger.info("Sales created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Sales, **kwargs: Any) -> Sales:
        """Update an existing sales instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Sales updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Sales) -> None:
        """Hard-delete a sales instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Sales deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Sales) -> Sales:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Sales deactivated: id=%s", instance.pk)
        return instance
