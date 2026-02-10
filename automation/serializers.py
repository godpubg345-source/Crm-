from rest_framework import serializers

from accounts.serializers import UserListSerializer
from .models import AutomationRule, AutomationRun, TaskEscalationPolicy


class AutomationRuleSerializer(serializers.ModelSerializer):
    trigger_display = serializers.CharField(source='get_trigger_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = AutomationRule
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']


class AutomationRunSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AutomationRun
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'ran_at']


class TaskEscalationPolicySerializer(serializers.ModelSerializer):
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    escalate_to_role_display = serializers.CharField(source='get_escalate_to_role_display', read_only=True)
    notify_channel_display = serializers.CharField(source='get_notify_channel_display', read_only=True)

    class Meta:
        model = TaskEscalationPolicy
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']
