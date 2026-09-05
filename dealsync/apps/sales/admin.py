from django.contrib import admin
from apps.sales.models import Quotation, QuotationItem, QuotationVersion


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 0
    readonly_fields = ("subtotal", "discount_amount", "tax_amount", "total_amount", "cost_amount", "margin_amount", "margin_percent")


class QuotationVersionInline(admin.TabularInline):
    model = QuotationVersion
    extra = 0
    readonly_fields = ("version_number", "snapshot_data", "changed_by", "changed_at", "change_reason")
    can_delete = False


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ("quotation_number", "customer_id", "sales_rep_id", "status", "approval_status", "total_amount", "margin_percent", "blended_risk_score", "created_at")
    list_filter = ("status", "approval_status", "currency", "is_active", "created_at")
    search_fields = ("quotation_number", "customer_id", "sales_rep_id", "notes")
    ordering = ("-created_at",)
    readonly_fields = ("quotation_number", "subtotal", "discount_amount", "tax_amount", "total_amount", "cost_amount", "margin_amount", "margin_percent", "blended_risk_score", "created_at", "updated_at")
    inlines = [QuotationItemInline, QuotationVersionInline]
    list_per_page = 25


@admin.register(QuotationItem)
class QuotationItemAdmin(admin.ModelAdmin):
    list_display = ("product_name", "quotation", "quantity", "unit_price", "discount_percent", "total_amount", "margin_percent")
    search_fields = ("product_name", "product_id", "quotation__quotation_number")


@admin.register(QuotationVersion)
class QuotationVersionAdmin(admin.ModelAdmin):
    list_display = ("quotation", "version_number", "changed_by", "changed_at", "change_reason")
    search_fields = ("quotation__quotation_number", "changed_by", "change_reason")
