from rest_framework import serializers
from .models import Task
from accounts.serializers import UserListSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserListSerializer(read_only=True)
    created_by = UserListSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Task.assigned_to.field.related_model.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_id',
            'created_by', 'student', 'application', 'due_date', 'priority', 'status',
            'category', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        if 'assigned_to' not in validated_data or validated_data['assigned_to'] is None:
            validated_data['assigned_to'] = user
        application = validated_data.get('application')
        if application and not validated_data.get('student'):
            validated_data['student'] = application.student
        if 'branch' not in validated_data and hasattr(self.context['request'].user, 'branch'):
             validated_data['branch'] = self.context['request'].user.branch
        return super().create(validated_data)
