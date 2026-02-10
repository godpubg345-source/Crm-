from rest_framework import serializers
from .models import Branch, TransferRequest, BranchTarget, FixedAsset, BranchComplaint


class BranchSerializer(serializers.ModelSerializer):
    """Serializer for Branch model."""
    
    is_currently_open = serializers.ReadOnlyField()
    local_time = serializers.ReadOnlyField()
    
    class Meta:
        model = Branch
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_currently_open', 'local_time']


class BranchListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Branch listings."""
    
    is_currently_open = serializers.ReadOnlyField()
    local_time = serializers.ReadOnlyField()

    class Meta:
        model = Branch
        fields = [
            'id',
            'code',
            'name',
            'country',
            'currency',
            'address',
            'phone',
            'email',
            'timezone',
            'latitude',
            'longitude',
            'opening_time',
            'closing_time',
            'auto_handoff_enabled',
            'is_hq',
            'is_active',
            'is_currently_open',
            'local_time'
        ]


class BranchAnalyticsSerializer(serializers.Serializer):
    """Serializer for branch analytics data."""
    total_leads = serializers.IntegerField()
    converted_leads = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    active_students = serializers.IntegerField()
    revenue_estimate = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)


class TransferRequestSerializer(serializers.ModelSerializer):
    """Serializer for TransferRequest model."""
    from_branch_name = serializers.ReadOnlyField(source='from_branch.name')
    to_branch_name = serializers.ReadOnlyField(source='to_branch.name')
    requested_by_name = serializers.ReadOnlyField(source='requested_by.get_full_name')
    target_name = serializers.SerializerMethodField()

    class Meta:
        model = TransferRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'requested_by', 'approved_by', 'created_at', 'updated_at']

    def get_target_name(self, obj):
        target = obj.lead if obj.lead else obj.student
        return str(target)


class BranchTargetSerializer(serializers.ModelSerializer):
    """Serializer for BranchTarget model."""
    class Meta:
        model = BranchTarget
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class FixedAssetSerializer(serializers.ModelSerializer):
    """Serializer for FixedAsset model."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FixedAsset
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class BranchComplaintSerializer(serializers.ModelSerializer):
    """Serializer for BranchComplaint model."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = BranchComplaint
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
