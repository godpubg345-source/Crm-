from rest_framework import serializers

from students.serializers import LeadListSerializer, StudentListSerializer, DocumentListSerializer
from universities.serializers import UniversityListSerializer
from accounts.serializers import UserListSerializer
from .models import PartnerContract, Agent, AgentAssignment, OCRJob


class PartnerContractSerializer(serializers.ModelSerializer):
    university_details = UniversityListSerializer(source='university', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()

    class Meta:
        model = PartnerContract
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

    def get_days_until_expiry(self, obj):
        if obj.end_date:
            from django.utils import timezone
            delta = obj.end_date - timezone.now().date()
            return max(delta.days, 0)
        return None


class AgentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    parent_agent_name = serializers.CharField(source='parent_agent.name', read_only=True)
    sub_agents_count = serializers.SerializerMethodField()

    class Meta:
        model = Agent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

    def get_sub_agents_count(self, obj):
        return obj.sub_agents.count()


class AgentAssignmentSerializer(serializers.ModelSerializer):
    lead_details = LeadListSerializer(source='lead', read_only=True)
    student_details = StudentListSerializer(source='student', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = AgentAssignment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

    def validate(self, attrs):
        lead = attrs.get('lead') or getattr(self.instance, 'lead', None)
        student = attrs.get('student') or getattr(self.instance, 'student', None)
        if bool(lead) == bool(student):
            raise serializers.ValidationError('Either lead or student must be set (not both).')
        return attrs


class OCRJobSerializer(serializers.ModelSerializer):
    document_details = DocumentListSerializer(source='document', read_only=True)
    requested_by_details = UserListSerializer(source='requested_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OCRJob
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'processed_at']
