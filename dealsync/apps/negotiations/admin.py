from django.contrib import admin
from apps.negotiations.models.negotiation import CustomerNegotiation


@admin.register(CustomerNegotiation)
class CustomerNegotiationAdmin(admin.ModelAdmin):
    list_display = ("id", "quotation", "counter_price", "status", "submitted_at")
    list_filter = ("status", "submitted_at")
    search_fields = ("quotation__id", "customer_notes")
