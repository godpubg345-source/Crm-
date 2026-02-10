from core.utils.pdf import render_to_pdf
from .models import CommissionClaim

class InvoiceService:
    """
    Service layer for Finance/Invoicing.
    """

    @staticmethod
    def generate_commission_invoice(claim: CommissionClaim):
        """
        Generate PDF invoice and update claim status.
        Returns pdf_response or None.
        """
        if not claim.university:
             return None
             
        context = {
            'claim': claim
        }
        
        pdf_response = render_to_pdf('finance/commission_invoice.html', context)
        
        if pdf_response:
            filename = f"Invoice_{claim.invoice_number or claim.id}.pdf"
            pdf_response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            # Auto-update status to INVOICED if currently PENDING
            if claim.status == CommissionClaim.Status.PENDING:
                claim.status = CommissionClaim.Status.INVOICED
                claim.save()
                
        return pdf_response

class CommissionService:
    """
    Service layer for automated commission calculations.
    """
    
    @staticmethod
    def calculate_commission(application):
        """
        Calculates expected commission for a given application.
        Uses CommissionStructure rules or fallback University rates.
        """
        from decimal import Decimal
        from .models import CommissionStructure, CommissionClaim
        
        # Ensure application has necessary fee data
        if not application.tuition_fee:
            return None
            
        # 1. Find the best matching commission structure
        # Prioritize course-specific structure, then university-level
        structure = CommissionStructure.objects.filter(
            university=application.university,
            course=application.course,
            is_active=True
        ).first()
        
        if not structure:
            structure = CommissionStructure.objects.filter(
                university=application.university,
                course__isnull=True,
                is_active=True
            ).first()
            
        if not structure:
            # Fallback to university-defined global rate
            rate = getattr(application.university, 'commission_rate', Decimal('0')) or Decimal('0')
            fixed = Decimal('0')
        else:
            rate = structure.commission_percentage
            fixed = structure.fixed_bonus
            
        # 2. Calculate total expected amount
        commission_amount = (application.tuition_fee * rate / 100) + fixed
        
        # 3. Create or update the CommissionClaim record
        claim, created = CommissionClaim.objects.update_or_create(
            application=application,
            defaults={
                'university': application.university,
                'expected_amount': commission_amount,
                'currency': getattr(application.course, 'currency', 'GBP') if application.course else 'GBP',
                'branch': application.branch,
                # Set status to PENDING for new claims
            }
        )
        
        return claim
