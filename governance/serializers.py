from rest_framework import serializers

from accounts.serializers import UserListSerializer
from .models import RetentionPolicy, DataDeletionRequest, AccessReviewCycle, AccessReviewItem


class RetentionPolicySerializer(serializers.ModelSerializer):
    entity_type_display = serializers.CharField(source='get_entity_type_display', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = RetentionPolicy
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']


class DataDeletionRequestSerializer(serializers.ModelSerializer):
    request_type_display = serializers.CharField(source='get_request_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_details = UserListSerializer(source='requested_by', read_only=True)
    approved_by_details = UserListSerializer(source='approved_by', read_only=True)

    class Meta:
        model = DataDeletionRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'requested_by', 'approved_by', 'completed_at']

    def validate(self, attrs):
        lead = attrs.get('lead') or getattr(self.instance, 'lead', None)
        student = attrs.get('student') or getattr(self.instance, 'student', None)
        document = attrs.get('document') or getattr(self.instance, 'document', None)
        targets = [t for t in [lead, student, document] if t]
        if len(targets) != 1:
            raise serializers.ValidationError('Exactly one target (lead, student, or document) must be set.')
        return attrs


class AccessReviewCycleSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = AccessReviewCycle
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']


class AccessReviewItemSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_details = UserListSerializer(source='reviewed_by', read_only=True)

    class Meta:
        model = AccessReviewItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'reviewed_at']
