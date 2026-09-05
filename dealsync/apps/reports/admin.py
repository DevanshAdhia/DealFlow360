from django.contrib import admin
from apps.reports.models.report import GeneratedReport


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ("id", "report_type", "generated_by", "created_at")
    list_filter = ("report_type", "created_at")
    search_fields = ("report_type", "parameters")
