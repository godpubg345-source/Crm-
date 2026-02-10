from rest_framework import serializers

from accounts.serializers import UserListSerializer
from students.serializers import DocumentListSerializer
from .models import ReviewSLA, DocumentReview


class ReviewSLASerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ReviewSLA
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch']


class DocumentReviewSerializer(serializers.ModelSerializer):
    document_details = DocumentListSerializer(source='document', read_only=True)
    reviewer_details = UserListSerializer(source='reviewer', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    sla_status_display = serializers.CharField(source='get_sla_status_display', read_only=True)

    class Meta:
        model = DocumentReview
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'sla_minutes', 'sla_status']

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        from core.utils.branch_context import resolve_branch_from_request, is_hq_user, is_country_manager, get_user_country

        user = request.user
        if not user or not user.is_authenticated:
            return attrs

        document = attrs.get('document') or getattr(self.instance, 'document', None)
        if document and not is_hq_user(user):
            if is_country_manager(user):
                user_country = get_user_country(user)
                if not user_country or document.branch.country != user_country:
                    raise serializers.ValidationError({'document': 'Document is outside your country scope.'})
            else:
                branch = resolve_branch_from_request(request)
                if branch is None or document.branch != branch:
                    raise serializers.ValidationError({'document': 'Document is outside your branch.'})
        return attrs
