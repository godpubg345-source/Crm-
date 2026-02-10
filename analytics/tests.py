from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request

from .views import AnalyticsViewSet


class AnalyticsTests(TestCase):
    def test_parse_period_invalid_date(self):
        factory = APIRequestFactory()
        request = factory.get('/api/v1/analytics/reports/branch-performance/?start=2026-99-99&end=2026-01-01')
        request = Request(request)
        viewset = AnalyticsViewSet()
        viewset.request = request
        with self.assertRaises(ValidationError):
            viewset._parse_period(request)
