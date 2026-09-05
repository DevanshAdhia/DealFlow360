from django.apps import AppConfig


class DiscountConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.discount"
    verbose_name = "Discount"

    def ready(self):
        pass  # Import signals here if needed
