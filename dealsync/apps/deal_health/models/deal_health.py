from django.db import models


class DealAlert(models.Model):
    SEVERITY_CHOICES = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    )

    ALERT_TYPE_CHOICES = (
        ("STALLED_DEAL", "Stalled Deal"),
        ("HIGH_DISCOUNT_RISK", "High Discount Risk"),
        ("MARGIN_EROSION", "Margin Erosion"),
        ("UNUSUAL_VOLUME", "Unusual Volume"),
    )

    quotation = models.ForeignKey(
        "sales.Quotation",
        on_delete=models.CASCADE,
        related_name="health_alerts"
    )
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=15, choices=SEVERITY_CHOICES, default="MEDIUM")
    title = models.CharField(max_length=255)
    details = models.TextField(blank=True, default="")
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "deal_alerts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.title} - Quotation {self.quotation_id}"
