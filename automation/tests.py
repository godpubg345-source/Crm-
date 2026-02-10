from django.test import TestCase

from branches.models import Branch
from .models import AutomationRule, AutomationRun


class AutomationTests(TestCase):
    def test_run_branch_inherits_rule(self):
        branch = Branch.objects.create(code='ISB', name='Islamabad', country='Pakistan')
        rule = AutomationRule.objects.create(name='Test Rule', trigger=AutomationRule.Trigger.LEAD_CREATED, branch=branch)
        run = AutomationRun.objects.create(rule=rule, branch=branch)
        self.assertEqual(run.branch, branch)
