from django.db import models
from django.conf import settings


class GeneratedReport(models.Model):
    REPORT_TYPE_CHOICES = (
        ("PDF_QUOTATION", "PDF Quotation"),
        ("XLSX_DISCOUNT_AUDIT", "XLSX Discount Audit"),
        ("XLSX_REVENUE_PIPELINE", "XLSX Revenue Pipeline"),
    )

    report_type = models.CharField(max_length=40, choices=REPORT_TYPE_CHOICES)
    file = models.FileField(upload_to="reports/%Y/%m/%d/", null=True, blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    generated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_reports"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "generated_reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_report_type_display()} #{self.id}"
