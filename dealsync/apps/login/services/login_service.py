import logging
from typing import Any, Optional
from django.db import transaction
from apps.login.models import Login

logger = logging.getLogger(__name__)


class LoginService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Login:
        """Create a new login instance."""
        instance = Login.objects.create(
            name=name,
            description=description,
        )
        logger.info("Login created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Login, **kwargs: Any) -> Login:
        """Update an existing login instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Login updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Login) -> None:
        """Hard-delete a login instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Login deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Login) -> Login:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Login deactivated: id=%s", instance.pk)
        return instance
