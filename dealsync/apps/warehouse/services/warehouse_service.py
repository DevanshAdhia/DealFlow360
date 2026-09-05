import logging
from typing import Any, Optional
from django.db import transaction
from apps.warehouse.models import Warehouse

logger = logging.getLogger(__name__)


class WarehouseService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Warehouse:
        """Create a new warehouse instance."""
        instance = Warehouse.objects.create(
            name=name,
            description=description,
        )
        logger.info("Warehouse created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Warehouse, **kwargs: Any) -> Warehouse:
        """Update an existing warehouse instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Warehouse updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Warehouse) -> None:
        """Hard-delete a warehouse instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Warehouse deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Warehouse) -> Warehouse:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Warehouse deactivated: id=%s", instance.pk)
        return instance
