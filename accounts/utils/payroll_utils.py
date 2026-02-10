import os
from io import BytesIO
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from django.conf import settings
from django.core.files.base import ContentFile

def generate_payslip_pdf(payroll_record):
    """
    Generates a high-fidelity, professional PDF payslip for an EmployeePayroll record.
    Returns a Django ContentFile that can be saved to a FileField.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=50, leftMargin=50,
        topMargin=50, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#AD03DE'), # BWBS Core Purple
        alignment=TA_LEFT,
        spaceAfter=20
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.gray,
        alignment=TA_LEFT
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        textColor=colors.black,
        alignment=TA_LEFT,
        spaceAfter=10
    )

    elements = []

    # 1. BWBS Header
    elements.append(Paragraph("BWBS EDUCATION", header_style))
    elements.append(Paragraph("Global Operations - Official Payout Advice", styles['Normal']))
    elements.append(Spacer(1, 0.4 * inch))

    # 2. Employee & Period Info
    info_data = [
        [Paragraph("EMPLOYEE NAME", label_style), Paragraph("PAYMENT PERIOD", label_style)],
        [Paragraph(f"{payroll_record.user.get_full_name().upper()}", value_style), 
         Paragraph(payroll_record.month.strftime('%B %Y').upper(), value_style)],
        [Paragraph("OPERATIVE ROLE", label_style), Paragraph("PAYMENT DATE", label_style)],
        [Paragraph(payroll_record.user.get_role_display().upper(), value_style), 
         Paragraph(payroll_record.payout_date.strftime('%Y-%m-%d') if payroll_record.payout_date else "PENDING", value_style)],
    ]
    
    info_table = Table(info_data, colWidths=[3 * inch, 3 * inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.5 * inch))

    # 3. Earnings & Deductions Table
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    financial_data = [
        [Paragraph("DESCRIPTION", table_header_style), Paragraph("AMOUNT", table_header_style)],
        ["Base Salary (Monthly)", f"£{payroll_record.base_salary_snapshot:,.2f}"],
        ["Performance Incentive", f"£{payroll_record.incentive_total:,.2f}"],
        ["", ""],
        [Paragraph("GROSS PAYOUT", ParagraphStyle('Gross', fontName='Helvetica-Bold')), f"£{payroll_record.gross_payout:,.2f}"],
        ["", ""],
        ["Tax Deductions", f"-£{payroll_record.tax_deductions:,.2f}"],
        ["Other Deductions", f"-£{payroll_record.other_deductions:,.2f}"],
        ["", ""],
        [Paragraph("NET DISBURSEMENT", ParagraphStyle('Net', fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#AD03DE'))), 
         Paragraph(f"£{payroll_record.net_payout:,.2f}", ParagraphStyle('NetVal', fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#AD03DE')))],
    ]

    finance_table = Table(financial_data, colWidths=[4 * inch, 2 * inch])
    finance_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')), # Dark Slate
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#AD03DE')),
        ('LINEBELOW', (0, 4), (-1, 4), 1, colors.gray),
        ('BOTTOMPADDING', (0, 9), (-1, 9), 10),
        ('TOPPADDING', (0, 9), (-1, 9), 10),
        ('LINEABOVE', (0, 9), (-1, 9), 2, colors.HexColor('#AD03DE')),
    ]))
    elements.append(finance_table)
    
    # 4. Footer & Signature
    elements.append(Spacer(1, 1 * inch))
    footer_text = "This is a computer-generated document. No physical signature is required for validity."
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(elements)
    
    # Save to buffer and return ContentFile
    pdf_content = buffer.getvalue()
    buffer.close()
    
    filename = f"payslip_{payroll_record.user.id}_{payroll_record.month.strftime('%Y_%m')}.pdf"
    return ContentFile(pdf_content, name=filename)

def calculate_payroll_report(user, months=6):
    """
    Aggregates payroll data for a specific user over the last N months.
    """
    from ..models import EmployeePayroll
    from django.db.models import Sum, Avg
    from dateutil.relativedelta import relativedelta
    from django.utils import timezone

    end_date = timezone.now().date().replace(day=1)
    start_date = end_date - relativedelta(months=months)

    records = EmployeePayroll.objects.filter(
        user=user,
        month__gte=start_date,
        month__lt=end_date,
        status='PAID'
    ).order_by('month')

    aggregation = records.aggregate(
        total_gross=Sum('gross_payout'),
        total_net=Sum('net_payout'),
        avg_monthly=Avg('net_payout')
    )

    return {
        'period': f"{months} Months",
        'start_date': start_date,
        'end_date': end_date,
        'records': records,
        'aggregates': aggregation
    }
