from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from branches.models import Branch
from accounts.models import User


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='TEST',
            name='Test Branch',
            country='Testland',
            currency='USD',
        )
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            first_name='Test',
            last_name='User',
            role=User.Role.COUNSELOR,
            branch=self.branch,
            password='StrongPass123!'
        )

    def test_login_returns_tokens(self):
        response = self.client.post(
            '/api/v1/auth/login/',
            {'email': self.user.email, 'password': 'StrongPass123!'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertNotIn('refresh', response.data)

    def test_logout_blacklists_refresh(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        response = self.client.post(
            '/api/v1/auth/logout/',
            {'refresh': str(refresh)},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
