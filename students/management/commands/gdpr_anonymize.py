from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from students.models import Student, Lead, Document


class Command(BaseCommand):
    help = "Anonymize soft-deleted students and leads after retention period."

    def handle(self, *args, **options):
        now = timezone.now()
        lead_days = getattr(settings, 'GDPR_LEAD_RETENTION_DAYS', 365 * 2)
        student_days = getattr(settings, 'GDPR_STUDENT_RETENTION_DAYS', 365 * 7)
        document_days = getattr(settings, 'GDPR_DOCUMENT_RETENTION_DAYS', 365 * 7)

        lead_cutoff = now - timezone.timedelta(days=lead_days)
        student_cutoff = now - timezone.timedelta(days=student_days)
        document_cutoff = now - timezone.timedelta(days=document_days)

        leads = Lead.all_objects.filter(
            is_deleted=True,
            is_anonymized=False,
            deleted_at__isnull=False,
            deleted_at__lt=lead_cutoff,
        )

        students = Student.all_objects.filter(
            is_deleted=True,
            is_anonymized=False,
            deleted_at__isnull=False,
            deleted_at__lt=student_cutoff,
        )

        documents = Document.all_objects.filter(
            is_deleted=True,
            is_anonymized=False,
            deleted_at__isnull=False,
            deleted_at__lt=document_cutoff,
        )

        lead_count = 0
        for lead in leads:
            lead.anonymize()
            lead_count += 1

        student_count = 0
        for student in students:
            student.anonymize()
            student_count += 1

        doc_count = 0
        for doc in documents:
            doc.anonymize()
            doc_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Anonymized {lead_count} leads, {student_count} students, {doc_count} documents."
        ))
