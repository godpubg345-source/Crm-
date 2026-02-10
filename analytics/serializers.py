from rest_framework import serializers

from accounts.serializers import UserListSerializer
from .models import BranchKpiInput, MetricSnapshot


class BranchKpiInputSerializer(serializers.ModelSerializer):
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = BranchKpiInput
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']


class MetricSnapshotSerializer(serializers.ModelSerializer):
    metric_type_display = serializers.CharField(source='get_metric_type_display', read_only=True)
    created_by_details = UserListSerializer(source='created_by', read_only=True)

    class Meta:
        model = MetricSnapshot
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'generated_at', 'created_by']
