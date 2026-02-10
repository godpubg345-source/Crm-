from django.test import TestCase
from django.utils import timezone

from branches.models import Branch
from accounts.models import User
from students.models import Student
from .models import Appointment


class AppointmentTests(TestCase):
    def test_appointment_branch_from_student(self):
        branch = Branch.objects.create(code='LHR', name='London', country='UK')
        counselor = User.objects.create_user(
            email='counselor6@example.com',
            username='counselor6',
            password='Testpass123!'
        )
        student = Student.objects.create(
            branch=branch,
            counselor=counselor,
            student_code='LHR-2026-0004',
            first_name='Appt',
            last_name='Student',
            email='appt@example.com'
        )
        start = timezone.now() + timezone.timedelta(days=1)
        appointment = Appointment.objects.create(
            student=student,
            counselor=counselor,
            scheduled_start=start,
            scheduled_end=start + timezone.timedelta(hours=1),
            branch=branch,
        )
        self.assertEqual(appointment.branch, branch)
