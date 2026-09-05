from django.db import models


class Discount(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "discount"
        verbose_name = "Discount"
        verbose_name_plural = "Discounts"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])
