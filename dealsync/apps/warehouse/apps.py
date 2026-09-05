from django.apps import AppConfig


class WarehouseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.warehouse"
    verbose_name = "Warehouse"

    def ready(self):
        pass  # Import signals here if needed
