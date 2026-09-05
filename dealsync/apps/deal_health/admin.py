from django.contrib import admin
from apps.deal_health.models.deal_health import DealAlert


@admin.register(DealAlert)
class DealAlertAdmin(admin.ModelAdmin):
    list_display = ("id", "quotation", "alert_type", "severity", "is_resolved", "created_at")
    list_filter = ("alert_type", "severity", "is_resolved")
    search_fields = ("title", "details")
