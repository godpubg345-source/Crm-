from django.test import RequestFactory, TestCase
from rest_framework.exceptions import PermissionDenied

from apps.identity.accounts.models import User
from apps.operations.branches.models import Branch
from apps.platform.core.utils.branch_context import assert_branch_access


class BranchAccessGuardTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.branch = Branch.objects.create(code='LHR', name='London', country='UK')
        self.user_without_branch = User.objects.create_user(
            email='nobranch@example.com',
            username='nobranch',
            password='Testpass123!',
            role=User.Role.COUNSELOR,
        )
        self.user_with_branch = User.objects.create_user(
            email='withbranch@example.com',
            username='withbranch',
            password='Testpass123!',
            role=User.Role.COUNSELOR,
            branch=self.branch,
        )

    def test_non_hq_user_without_branch_context_is_denied(self):
        request = self.factory.post('/api/v1/applications/')
        request.user = self.user_without_branch

        with self.assertRaises(PermissionDenied):
            assert_branch_access(request, self.branch)

    def test_non_hq_user_with_matching_branch_is_allowed(self):
        request = self.factory.post('/api/v1/applications/')
        request.user = self.user_with_branch

        assert_branch_access(request, self.branch)
