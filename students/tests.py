from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from branches.models import Branch
from accounts.models import User
from students.models import Lead, Student
from tasks.models import Task


class LeadAndStudentAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='B1',
            name='Branch One',
            country='Testland',
            currency='USD',
        )
        self.counselor_1 = User.objects.create_user(
            username='counselor1',
            email='counselor1@example.com',
            first_name='Counselor',
            last_name='One',
            role=User.Role.COUNSELOR,
            branch=self.branch,
            password='StrongPass123!'
        )
        self.counselor_2 = User.objects.create_user(
            username='counselor2',
            email='counselor2@example.com',
            first_name='Counselor',
            last_name='Two',
            role=User.Role.COUNSELOR,
            branch=self.branch,
            password='StrongPass123!'
        )

        self.lead_1 = Lead.objects.create(
            first_name='Ali',
            last_name='One',
            email='ali.one@example.com',
            branch=self.branch,
            assigned_to=self.counselor_1,
        )
        self.lead_2 = Lead.objects.create(
            first_name='Sara',
            last_name='Two',
            email='sara.two@example.com',
            branch=self.branch,
            assigned_to=self.counselor_2,
        )

        self.student_1 = Student.objects.create(
            branch=self.branch,
            counselor=self.counselor_1,
            first_name='Student',
            last_name='One',
            email='student.one@example.com',
        )
        self.student_2 = Student.objects.create(
            branch=self.branch,
            counselor=self.counselor_2,
            first_name='Student',
            last_name='Two',
            email='student.two@example.com',
        )

    def _extract_results(self, response):
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']
        return response.data

    def test_counselor_lead_visibility(self):
        self.client.force_authenticate(user=self.counselor_1)
        response = self.client.get('/api/v1/leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._extract_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.lead_1.id))

    def test_counselor_student_visibility(self):
        self.client.force_authenticate(user=self.counselor_1)
        response = self.client.get('/api/v1/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._extract_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.student_1.id))

    def test_lead_creation_creates_follow_up_task(self):
        lead = Lead.objects.create(
            first_name='Task',
            last_name='Lead',
            email='task.lead@example.com',
            branch=self.branch,
            assigned_to=self.counselor_1,
        )
        task = Task.objects.filter(assigned_to=self.counselor_1, title__icontains=lead.full_name).first()
        self.assertIsNotNone(task)
