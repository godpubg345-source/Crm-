from rest_framework import serializers

from accounts.models import User
from branches.models import Branch
from .models import AuditLog


class AuditActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']


class AuditBranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'code', 'country']


class AuditLogSerializer(serializers.ModelSerializer):
    actor_details = AuditActorSerializer(source='actor', read_only=True)
    branch_details = AuditBranchSerializer(source='branch', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
