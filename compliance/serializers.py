from rest_framework import serializers

from accounts.serializers import UserListSerializer
from .models import ComplianceRule, ComplianceRuleChange


class ComplianceRuleSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)
    updated_by_details = UserListSerializer(source='updated_by', read_only=True)

    class Meta:
        model = ComplianceRule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by', 'updated_by']

    def validate(self, attrs):
        effective_from = attrs.get('effective_from') or getattr(self.instance, 'effective_from', None)
        effective_to = attrs.get('effective_to') or getattr(self.instance, 'effective_to', None)
        if effective_from and effective_to and effective_to < effective_from:
            raise serializers.ValidationError({'effective_to': 'effective_to must be on or after effective_from.'})
        return attrs


class ComplianceRuleChangeSerializer(serializers.ModelSerializer):
    changed_by_details = UserListSerializer(source='changed_by', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ComplianceRuleChange
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'changed_at']
