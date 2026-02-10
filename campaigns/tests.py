from django.test import TestCase

from branches.models import Branch
from accounts.models import User
from students.models import Student
from .models import Campaign, CampaignEnrollment


class CampaignTests(TestCase):
    def test_enrollment_branch_from_campaign(self):
        branch = Branch.objects.create(code='LHR', name='London', country='UK')
        counselor = User.objects.create_user(
            email='counselor4@example.com',
            username='counselor4',
            password='Testpass123!'
        )
        student = Student.objects.create(
            branch=branch,
            counselor=counselor,
            student_code='LHR-2026-0002',
            first_name='Camp',
            last_name='Student',
            email='camp@example.com'
        )
        campaign = Campaign.objects.create(name='Welcome', branch=branch)
        enrollment = CampaignEnrollment.objects.create(campaign=campaign, student=student)
        self.assertEqual(enrollment.branch, branch)
