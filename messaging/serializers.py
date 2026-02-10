from rest_framework import serializers

from accounts.serializers import UserListSerializer
from .models import MessageTemplate, MessageLog


class MessageTemplateSerializer(serializers.ModelSerializer):
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)
    updated_by_details = UserListSerializer(source='updated_by', read_only=True)

    class Meta:
        model = MessageTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by', 'updated_by']


class MessageLogSerializer(serializers.ModelSerializer):
    template_details = MessageTemplateSerializer(source='template', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MessageLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']
