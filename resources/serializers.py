from rest_framework import serializers
from .models import Resource
from accounts.serializers import UserListSerializer

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = UserListSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'file', 'link', 'category',
            'uploaded_by', 'visible_to_roles', 'created_at', 'updated_at', 'file_url'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
