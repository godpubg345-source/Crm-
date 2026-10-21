from django.test import TestCase

from apps.operations.branches.models import Branch
from apps.identity.accounts.models import User
from apps.crm.students.models import Student
from .models import MessageLog, MessageTemplate


class MessagingTests(TestCase):
    def test_message_log_branch_from_student(self):
        branch = Branch.objects.create(code='KHI', name='Karachi', country='Pakistan')
        counselor = User.objects.create_user(
            email='counselor3@example.com',
            username='counselor3',
            password='Testpass123!'
        )
        student = Student.objects.create(
            branch=branch,
            counselor=counselor,
            student_code='KHI-2026-0001',
            first_name='Msg',
            last_name='Student',
            email='msg@example.com'
        )
        log = MessageLog.objects.create(
            channel=MessageTemplate.Channel.EMAIL,
            recipient='msg@example.com',
            status=MessageLog.Status.QUEUED,
            student=student,
        )
        self.assertEqual(log.branch, branch)
