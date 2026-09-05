import io
from django.db import transaction
from apps.reports.models.report import GeneratedReport


class ReportService:
    @staticmethod
    @transaction.atomic
    def create_report_record(report_type: str, user, parameters: dict = None) -> GeneratedReport:
        return GeneratedReport.objects.create(
            report_type=report_type,
            generated_by=user,
            parameters=parameters or {},
        )

    @staticmethod
    def generate_quotation_pdf_bytes(quotation) -> bytes:
        """
        Generates PDF document content for a quotation.
        Falls back to formatted plain text/PDF stream.
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            p.drawString(100, 750, f"DealFlow360 Quotation: {quotation.quotation_number}")
            p.drawString(100, 730, f"Customer: {quotation.customer.name if quotation.customer else 'N/A'}")
            p.drawString(100, 710, f"Total Amount: {quotation.currency} {quotation.total_amount}")
            p.drawString(100, 690, f"Risk Score: {quotation.blended_risk_score}")
            p.showPage()
            p.save()
            buffer.seek(0)
            return buffer.getvalue()
        except ImportError:
            content = f"Quotation: {quotation.quotation_number}\nTotal: {quotation.total_amount}\n"
            return content.encode("utf-8")

    @staticmethod
    def generate_discount_audit_xlsx_bytes() -> bytes:
        """
        Generates XLSX audit workbook.
        """
        try:
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Discount Audit"
            ws.append(["Rule ID", "Customer Tier", "Category", "Max Discount %", "Min Margin %"])
            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)
            return buffer.getvalue()
        except ImportError:
            content = "Rule ID,Customer Tier,Category,Max Discount %,Min Margin %\n"
            return content.encode("utf-8")
