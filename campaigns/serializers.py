from rest_framework import serializers

from accounts.serializers import UserListSerializer
from students.serializers import LeadListSerializer, StudentListSerializer
from messaging.serializers import MessageTemplateSerializer
from .models import Campaign, CampaignStep, CampaignEnrollment, CampaignActivity


class CampaignSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']


class CampaignStepSerializer(serializers.ModelSerializer):
    template_details = MessageTemplateSerializer(source='template', read_only=True)

    class Meta:
        model = CampaignStep
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

    def validate(self, attrs):
        campaign = attrs.get('campaign') or getattr(self.instance, 'campaign', None)
        if campaign and attrs.get('branch') and attrs['branch'] != campaign.branch:
            raise serializers.ValidationError({'branch': 'Branch must match campaign branch.'})
        return attrs


class CampaignEnrollmentSerializer(serializers.ModelSerializer):
    lead_details = LeadListSerializer(source='lead', read_only=True)
    student_details = StudentListSerializer(source='student', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CampaignEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']

    def validate(self, attrs):
        lead = attrs.get('lead') or getattr(self.instance, 'lead', None)
        student = attrs.get('student') or getattr(self.instance, 'student', None)
        if bool(lead) == bool(student):
            raise serializers.ValidationError('Either lead or student must be set (not both).')
        campaign = attrs.get('campaign') or getattr(self.instance, 'campaign', None)
        if campaign:
            target_branch = lead.branch if lead else student.branch
            if target_branch and campaign.branch and target_branch != campaign.branch:
                raise serializers.ValidationError({'campaign': 'Campaign branch must match target branch.'})
        return attrs


class CampaignActivitySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CampaignActivity
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']
