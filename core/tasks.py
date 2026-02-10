from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from students.models import Document, DocumentAlert

@shared_task
def check_document_expiries():
    """
    Scans for documents approaching their expiry date and generates alerts.
    This task should be scheduled to run daily via Celery Beat.
    """
    today = timezone.now().date()
    
    # 1. Fetch documents that have an expiry date and are not deleted
    # Use select_related to minimize queries
    documents = Document.objects.filter(
        expiry_date__isnull=False,
        is_deleted=False
    ).select_related('student', 'branch')
    
    alerts_created = 0
    
    for doc in documents:
        # 2. Check if we are within the notification window
        notify_date = doc.expiry_date - timedelta(days=doc.notify_before_days)
        
        if today >= notify_date:
            # 3. Check if an active (unacknowledged) alert already exists for this document
            # to avoid spamming alerts every day
            existing_alert = DocumentAlert.objects.filter(
                document=doc, 
                is_acknowledged=False
            ).exists()
            
            if not existing_alert:
                # 4. Determine severity based on proximity to expiry
                days_left = (doc.expiry_date - today).days
                
                if days_left < 7:
                    severity = DocumentAlert.Severity.CRITICAL
                elif days_left < 30:
                    severity = DocumentAlert.Severity.WARNING
                else:
                    severity = DocumentAlert.Severity.INFO
                
                # 5. Create the alert
                DocumentAlert.objects.create(
                    document=doc,
                    severity=severity,
                    branch=doc.branch
                )
                alerts_created += 1
                
    return f"Success: Scanned documents. Generated {alerts_created} alerts for Risk Mitigation."
