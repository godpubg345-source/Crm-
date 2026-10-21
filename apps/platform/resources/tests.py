from rest_framework.test import APITestCase

from apps.identity.accounts.models import User
from apps.platform.resources.models import Resource


class ResourceVisibilityTests(APITestCase):
    def setUp(self):
        self.counselor = User.objects.create_user(
            email='counselor-resource@example.com',
            username='counselor-resource',
            password='Testpass123!',
            role=User.Role.COUNSELOR,
        )
        self.manager = User.objects.create_user(
            email='manager-resource@example.com',
            username='manager-resource',
            password='Testpass123!',
            role=User.Role.BRANCH_MANAGER,
        )
        self.superuser = User.objects.create_superuser(
            email='admin-resource@example.com',
            username='admin-resource',
            password='Testpass123!',
            first_name='Admin',
            last_name='User',
        )

        Resource.objects.create(title='Public Resource', category='OTHER', visible_to_roles=[])
        Resource.objects.create(
            title='Counselor Resource',
            category='OTHER',
            visible_to_roles=[User.Role.COUNSELOR],
        )
        Resource.objects.create(
            title='Manager Resource',
            category='OTHER',
            visible_to_roles=[User.Role.BRANCH_MANAGER],
        )

    def _titles_from_response(self, response):
        payload = response.json()
        items = payload.get('results', payload) if isinstance(payload, dict) else payload
        return {item['title'] for item in items}

    def test_counselor_sees_public_and_counselor_resources(self):
        self.client.force_authenticate(user=self.counselor)
        response = self.client.get('/api/v1/resources/')
        self.assertEqual(response.status_code, 200)

        titles = self._titles_from_response(response)
        self.assertIn('Public Resource', titles)
        self.assertIn('Counselor Resource', titles)
        self.assertNotIn('Manager Resource', titles)

    def test_manager_sees_public_and_manager_resources(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.get('/api/v1/resources/')
        self.assertEqual(response.status_code, 200)

        titles = self._titles_from_response(response)
        self.assertIn('Public Resource', titles)
        self.assertIn('Manager Resource', titles)
        self.assertNotIn('Counselor Resource', titles)

    def test_superuser_sees_all_resources(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get('/api/v1/resources/')
        self.assertEqual(response.status_code, 200)

        titles = self._titles_from_response(response)
        self.assertIn('Public Resource', titles)
        self.assertIn('Counselor Resource', titles)
        self.assertIn('Manager Resource', titles)
