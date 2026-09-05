from django.db import models


class CustomerTier(models.Model):
    name = models.CharField(max_length=50, unique=True)
    max_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_tiers"
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} (Max {self.max_discount_percent}%)"


class Customer(models.Model):
    customer_tier = models.ForeignKey(
        CustomerTier,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="customers"
    )
    customer_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    address = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "customer"
        db_table = "customers"
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.customer_code or 'No Code'})"

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])
