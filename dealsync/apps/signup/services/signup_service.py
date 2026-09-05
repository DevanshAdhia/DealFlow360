import logging
from typing import Any, Optional
from django.db import transaction
from apps.signup.models import Signup

logger = logging.getLogger(__name__)


class SignupService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Signup:
        """Create a new signup instance."""
        instance = Signup.objects.create(
            name=name,
            description=description,
        )
        logger.info("Signup created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Signup, **kwargs: Any) -> Signup:
        """Update an existing signup instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Signup updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Signup) -> None:
        """Hard-delete a signup instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Signup deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Signup) -> Signup:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Signup deactivated: id=%s", instance.pk)
        return instance
