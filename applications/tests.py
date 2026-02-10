from django.test import TestCase
from django.utils import timezone

from branches.models import Branch
from accounts.models import User
from students.models import Student
from applications.models import Application
from tasks.models import Task


class ApplicationSignalTests(TestCase):
    def setUp(self):
        self.branch = Branch.objects.create(
            code='B2',
            name='Branch Two',
            country='Testland',
            currency='USD',
        )
        self.counselor = User.objects.create_user(
            username='appcounselor',
            email='app.counselor@example.com',
            first_name='App',
            last_name='Counselor',
            role=User.Role.COUNSELOR,
            branch=self.branch,
            password='StrongPass123!'
        )
        self.student = Student.objects.create(
            branch=self.branch,
            counselor=self.counselor,
            first_name='App',
            last_name='Student',
            email='app.student@example.com',
        )

        self.application = Application.objects.create(
            student=self.student,
            branch=self.branch,
            intake='Sep 2026',
        )

    def test_cas_received_creates_task(self):
        self.application.status = Application.Status.CAS_RECEIVED
        self.application.submission_date = timezone.now().date()
        self.application.save()

        task = Task.objects.filter(
            assigned_to=self.counselor,
            title__icontains='Prepare Visa Case'
        ).first()
        self.assertIsNotNone(task)
