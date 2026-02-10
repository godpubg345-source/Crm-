from django.core.management.base import BaseCommand
from branches.models import Branch, BranchAnalyticsSnapshot
from branches.views import BranchViewSet
from rest_framework.test import APIRequestFactory
from django.utils import timezone

class Command(BaseCommand):
    help = 'Generates and saves BI snapshots for all branches'

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            self.stdout.write(self.style.WARNING("No superuser found. Using anonymous user (might fail permissions)."))

        branches = Branch.objects.filter(is_active=True)
        factory = APIRequestFactory()
        viewset = BranchViewSet()
        
        self.stdout.write(self.style.SUCCESS(f"Starting snapshot generation for {len(branches)} branches..."))
        
        for branch in branches:
            try:
                # Mock a request and setup viewset
                request = factory.get('/')
                request.user = user
                viewset.request = request
                viewset.format_kwarg = None
                viewset.kwargs = {'pk': branch.id}
                
                # Get analytics data
                analytics_data = viewset.analytics(request, pk=branch.id).data
                # Get finance data
                finance_data = viewset.finance_summary(request, pk=branch.id).data
                # Get pipeline data
                pipeline_data = viewset.pipeline_analysis(request, pk=branch.id).data
                
                # Create or Update snapshot
                BranchAnalyticsSnapshot.objects.update_or_create(
                    branch=branch,
                    snapshot_date=timezone.now().date(),
                    defaults={
                        'total_leads': analytics_data['total_leads'],
                        'converted_leads': analytics_data['converted_leads'],
                        'conversion_rate': analytics_data['conversion_rate'],
                        'active_students': analytics_data['active_students'],
                        'total_revenue_estimate': finance_data['total_revenue_estimate'],
                        'total_payroll_monthly': finance_data['total_payroll_monthly'],
                        'pipeline_state': pipeline_data
                    }
                )
                self.stdout.write(self.style.SUCCESS(f"Successfully generated snapshot for {branch.code}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to generate snapshot for {branch.code}: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS("Snapshot generation complete."))
