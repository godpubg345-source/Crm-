from django.test import TestCase

from branches.models import Branch
from accounts.models import User
from students.models import Student, Document
from .models import OCRJob


class OperationsTests(TestCase):
    def test_ocr_job_branch_from_document(self):
        branch = Branch.objects.create(code='LHR', name='London', country='UK')
        counselor = User.objects.create_user(
            email='counselor5@example.com',
            username='counselor5',
            password='Testpass123!'
        )
        student = Student.objects.create(
            branch=branch,
            counselor=counselor,
            student_code='LHR-2026-0003',
            first_name='Ops',
            last_name='Student',
            email='ops@example.com'
        )
        document = Document.objects.create(
            student=student,
            branch=branch,
            category=Document.Category.CV,
            document_type='CV',
            file_name='cv.pdf',
            file_size=100,
            uploaded_by=None,
        )
        job = OCRJob.objects.create(document=document)
        self.assertEqual(job.branch, branch)
