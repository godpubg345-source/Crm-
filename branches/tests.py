from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User
from branches.models import Branch

class BranchListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='HQ',
            name='Headquarters',
            country='United Kingdom',
            currency='GBP',
            timezone='Europe/London',
            opening_time='09:00:00',
            closing_time='18:00:00',
            auto_handoff_enabled=True
        )
        self.user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            role=User.Role.SUPER_ADMIN,
            password='StrongPass123!',
            is_superuser=True
        )
        self.client.force_authenticate(user=self.user)

    def test_branch_list_includes_operational_fields(self):
        response = self.client.get('/api/v1/branches/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        branch = response.data['results'][0]
        for field in [
            'currency',
            'timezone',
            'opening_time',
            'closing_time',
            'auto_handoff_enabled',
            'is_currently_open',
            'local_time'
        ]:
            self.assertIn(field, branch)
