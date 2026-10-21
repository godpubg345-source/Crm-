from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.operations.branches.models import Branch
from apps.identity.accounts.models import User


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

    def test_me_patch_updates_profile(self):
        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        response = self.client.patch(
            '/api/v1/users/me/',
            {'first_name': 'Updated', 'phone': '+92-300-0000000'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.phone, '+92-300-0000000')

    def test_change_password_updates_credentials(self):
        access = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')

        response = self.client.post(
            '/api/v1/users/change-password/',
            {'current_password': 'StrongPass123!', 'new_password': 'EvenStronger123!'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('EvenStronger123!'))
