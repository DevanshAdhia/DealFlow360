from django.db import models
from django.conf import settings


class CustomerNegotiation(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
        ("COUNTERED", "Countered"),
    )

    quotation = models.ForeignKey(
        "sales.Quotation",
        on_delete=models.CASCADE,
        related_name="negotiations"
    )
    counter_price = models.DecimalField(max_digits=12, decimal_places=2)
    customer_notes = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    submitted_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    response_notes = models.TextField(blank=True, default="")

    class Meta:
        db_table = "customer_negotiations"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Negotiation {self.id} for Quotation {self.quotation_id} - {self.status}"
