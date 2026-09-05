from django.db import models
from apps.customer.models import CustomerTier


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "product_categories"
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    PRODUCT_TYPE_CHOICES = (
        ("HARDWARE", "Hardware"),
        ("SERVICE", "Service"),
        ("SUBSCRIPTION", "Subscription"),
    )

    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default="HARDWARE")
    sales_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "product"
        db_table = "products"
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.sku or 'No SKU'})"

    def deactivate(self) -> None:
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="variants")
    sku = models.CharField(max_length=100, unique=True)
    attributes = models.JSONField(default=dict, blank=True)
    sales_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = "product_variants"

    def __str__(self) -> str:
        p_name = self.product.name if self.product else "N/A"
        return f"{p_name} - {self.sku}"


class PriceList(models.Model):
    customer_tier = models.ForeignKey(CustomerTier, on_delete=models.CASCADE, null=True, blank=True, related_name="price_lists")
    name = models.CharField(max_length=100)
    currency = models.CharField(max_length=10, default="USD")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "price_lists"

    def __str__(self) -> str:
        t_name = self.customer_tier.name if self.customer_tier else "All"
        return f"{self.name} ({t_name})"


class PriceListItem(models.Model):
    price_list = models.ForeignKey(PriceList, on_delete=models.CASCADE, null=True, blank=True, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="price_list_items")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = "price_list_items"
        unique_together = ("price_list", "product")

    def __str__(self) -> str:
        return f"{self.price_list_id}: {self.product_id} @ {self.unit_price}"
