import logging
from typing import Any, Optional
from django.db import transaction
from apps.product.models import Product

logger = logging.getLogger(__name__)


class ProductService:

    @staticmethod
    @transaction.atomic
    def create(name: str, description: str = "") -> Product:
        """Create a new product instance."""
        instance = Product.objects.create(
            name=name,
            description=description,
        )
        logger.info("Product created: id=%s name=%s", instance.pk, instance.name)
        return instance

    @staticmethod
    @transaction.atomic
    def update(instance: Product, **kwargs: Any) -> Product:
        """Update an existing product instance."""
        for field, value in kwargs.items():
            setattr(instance, field, value)
        instance.save()
        logger.info("Product updated: id=%s", instance.pk)
        return instance

    @staticmethod
    @transaction.atomic
    def delete(instance: Product) -> None:
        """Hard-delete a product instance."""
        pk = instance.pk
        instance.delete()
        logger.info("Product deleted: id=%s", pk)

    @staticmethod
    @transaction.atomic
    def soft_delete(instance: Product) -> Product:
        """Soft-delete by deactivating."""
        instance.deactivate()
        logger.info("Product deactivated: id=%s", instance.pk)
        return instance
