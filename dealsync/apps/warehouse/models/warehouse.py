from django.db import models
from apps.product.models import Product, ProductVariant
from apps.customer.models import Customer


class Warehouse(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    location_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    address = models.TextField(blank=True, default="")
    description = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "warehouse"
        db_table = "warehouses"
        verbose_name = "Warehouse"
        verbose_name_plural = "Warehouses"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.location_code or 'No Code'})"


class Inventory(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, null=True, blank=True, related_name="inventories")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name="inventories")
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name="inventories")
    quantity_on_hand = models.PositiveIntegerField(default=0)
    quantity_reserved = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "inventories"
        unique_together = ("warehouse", "product", "variant")

    def __str__(self) -> str:
        wh_name = self.warehouse.name if self.warehouse else "N/A"
        p_name = self.product.name if self.product else "N/A"
        return f"{wh_name}: {p_name} ({self.available_to_allocate} avail)"

    @property
    def available_to_allocate(self) -> int:
        return max(0, self.quantity_on_hand - self.quantity_reserved)


class Order(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("IN_FULFILLMENT", "In Fulfillment"),
        ("FULFILLED", "Fulfilled"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    quotation = models.ForeignKey("sales.Quotation", on_delete=models.PROTECT, null=True, blank=True, related_name="orders")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, null=True, blank=True, related_name="orders")
    order_number = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    class Meta:
        db_table = "orders"
        ordering = ["-order_date"]

    def __str__(self) -> str:
        return f"Order {self.order_number} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = "order_items"

    def __str__(self) -> str:
        p_name = self.product.name if self.product else "N/A"
        return f"{self.order_id} - {p_name} x {self.quantity}"


class FulfillmentOrder(models.Model):
    STATUS_CHOICES = (
        ("PICKING", "Picking"),
        ("PACKING", "Packing"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name="fulfillments")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, null=True, blank=True, related_name="fulfillments")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PICKING")
    tracking_number = models.CharField(max_length=100, blank=True, default="")
    shipped_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "fulfillment_orders"

    def __str__(self) -> str:
        return f"Fulfillment for {self.order_id} [{self.status}]"


class FulfillmentItem(models.Model):
    fulfillment_order = models.ForeignKey(FulfillmentOrder, on_delete=models.CASCADE, null=True, blank=True, related_name="items")
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, null=True, blank=True)
    quantity_shipped = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "fulfillment_items"

    def __str__(self) -> str:
        return f"{self.fulfillment_order_id} - Shipped {self.quantity_shipped}"


class Backorder(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("RESTOCKED", "Restocked"),
        ("FULFILLED", "Fulfilled"),
    )

    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, null=True, blank=True, related_name="backorders")
    quantity_backordered = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    expected_restock_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "backorders"

    def __str__(self) -> str:
        return f"Backorder for {self.order_item_id} ({self.quantity_backordered})"
