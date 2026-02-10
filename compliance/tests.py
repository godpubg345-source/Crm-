from django.test import TestCase

from branches.models import Branch
from .models import ComplianceRule, ComplianceRuleChange


class ComplianceRuleTests(TestCase):
    def test_change_inherits_branch(self):
        branch = Branch.objects.create(code='LHR', name='London', country='UK')
        rule = ComplianceRule.objects.create(branch=branch, name='CAS Rule', country='UK')
        change = ComplianceRuleChange.objects.create(rule=rule, action=ComplianceRuleChange.Action.CREATE, branch=branch)
        self.assertEqual(change.branch, branch)
