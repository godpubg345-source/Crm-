from django.test import TestCase

from branches.models import Branch
from accounts.models import User
from students.models import Student, Document
from .models import DocumentReview


class DocumentReviewTests(TestCase):
    def test_review_branch_inherits_document(self):
        branch = Branch.objects.create(code='DXB', name='Dubai', country='UAE')
        counselor = User.objects.create_user(
            email='counselor2@example.com',
            username='counselor2',
            password='Testpass123!'
        )
        student = Student.objects.create(
            branch=branch,
            counselor=counselor,
            student_code='DXB-2026-0001',
            first_name='Review',
            last_name='Student',
            email='review@example.com'
        )
        document = Document.objects.create(
            student=student,
            branch=branch,
            category=Document.Category.SOP,
            document_type='SOP',
            file_name='sop.pdf',
            file_size=100,
            uploaded_by=None,
        )
        review = DocumentReview.objects.create(document=document)
        self.assertEqual(review.branch, branch)
