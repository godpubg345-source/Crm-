from django.test import SimpleTestCase
from django.urls import reverse


class FinanceRouteTests(SimpleTestCase):
    def test_commission_invoice_alias_route_exists(self):
        url = reverse('commission-invoice', kwargs={'pk': '11111111-1111-1111-1111-111111111111'})
        self.assertEqual(url, '/api/v1/finance/commissions/11111111-1111-1111-1111-111111111111/invoice/')

    def test_commission_download_invoice_route_still_exists(self):
        url = reverse('commission-download-invoice', kwargs={'pk': '11111111-1111-1111-1111-111111111111'})
        self.assertEqual(url, '/api/v1/finance/commissions/11111111-1111-1111-1111-111111111111/download_invoice/')
