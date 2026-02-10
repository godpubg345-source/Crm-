from celery import shared_task
from django.utils import timezone

from .models import OCRJob


@shared_task
def process_ocr_job(job_id):
    try:
        job = OCRJob.objects.select_related('document').get(id=job_id)
    except OCRJob.DoesNotExist:
        return 'not_found'

    job.status = OCRJob.Status.PROCESSING
    job.save(update_fields=['status', 'updated_at'])

    # Placeholder for OCR integration
    job.raw_text = job.raw_text or ''
    job.extracted_data = job.extracted_data or {}
    job.classification_label = job.classification_label or job.document.category
    job.confidence = job.confidence or 0
    job.status = OCRJob.Status.COMPLETED
    job.processed_at = timezone.now()
    job.save(update_fields=['raw_text', 'extracted_data', 'classification_label', 'confidence', 'status', 'processed_at', 'updated_at'])

    return str(job.id)
