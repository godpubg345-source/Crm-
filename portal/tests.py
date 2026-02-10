from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile

from branches.models import Branch
from accounts.models import User
from students.models import Student, Document
from portal.models import PortalAccess


class PortalAuthFlowTests(TestCase):
    def setUp(self):
        self.branch = Branch.objects.create(code='LHR', name='London', country='UK')
        self.counselor = User.objects.create_user(
            email='counselor@example.com',
            username='counselor',
            password='Testpass123!'
        )
        self.student = Student.objects.create(
            branch=self.branch,
            counselor=self.counselor,
            student_code='LHR-2026-0001',
            first_name='Test',
            last_name='Student',
            email='student@example.com'
        )
        self.portal_access = PortalAccess.objects.create(student=self.student)

    def test_portal_login_and_me(self):
        response = self.client.post('/api/v1/portal/auth/login/', {'invite_token': str(self.portal_access.invite_token)})
        self.assertEqual(response.status_code, 200)
        token = response.json().get('session_token')
        self.assertTrue(token)

        me_response = self.client.get('/api/v1/portal/me/', **{'HTTP_X_PORTAL_TOKEN': token})
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['student']['student_code'], 'LHR-2026-0001')

    def test_portal_upload_document(self):
        response = self.client.post('/api/v1/portal/auth/login/', {'invite_token': str(self.portal_access.invite_token)})
        token = response.json().get('session_token')
        file_obj = SimpleUploadedFile('passport.pdf', b'%PDF-1.4 test', content_type='application/pdf')

        upload_response = self.client.post(
            '/api/v1/portal/me/upload-document/',
            {
                'student': str(self.student.id),
                'category': Document.Category.PASSPORT,
                'document_type': 'Passport',
                'file': file_obj,
            },
            **{'HTTP_X_PORTAL_TOKEN': token}
        )
        self.assertEqual(upload_response.status_code, 201)
        self.assertEqual(upload_response.json()['category'], Document.Category.PASSPORT)

    def test_invalid_invite_token(self):
        response = self.client.post('/api/v1/portal/auth/login/', {'invite_token': 'invalid-token'})
        self.assertEqual(response.status_code, 404)
