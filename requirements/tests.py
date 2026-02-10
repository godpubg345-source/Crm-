from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from requirements.models import VisaType, RequiredDocument, RequirementRule


class RequirementsCheckTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.visa_type = VisaType.objects.create(name='Student')
        self.document = RequiredDocument.objects.create(name='CAS Statement', description='CAS issued by university')
        self.rule = RequirementRule.objects.create(
            visa_type=self.visa_type,
            destination_country='UK',
            origin_country='PAKISTAN',
            is_mandatory=True,
            notes='Required for Pakistani applicants'
        )
        self.rule.required_documents.add(self.document)

    def test_requirements_check_returns_docs(self):
        response = self.client.get('/api/v1/requirements/check/?country=UK&nationality=PAKISTAN&visa_type=Student')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        first = response.data[0]
        self.assertEqual(str(first['name']), 'CAS Statement')
        self.assertTrue(first['is_mandatory'])
        self.assertIn('origin_country', first)
