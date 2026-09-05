import logging
from typing import Any, Optional
from django.db import transaction
from apps.customer.models import Customer

logger = logging.getLogger(__name__)


class CustomerService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Customer:
        """Create a new customer instance."""
        instance = Customer.objects.create(
            name=name,
            description=description,
        )
        logger.info("Customer created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Customer, **kwargs: Any) -> Customer:
        """Update an existing customer instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Customer updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Customer) -> None:
        """Hard-delete a customer instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Customer deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Customer) -> Customer:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Customer deactivated: id=%s", instance.pk)
        return instance
