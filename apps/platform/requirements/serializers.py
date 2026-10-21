from rest_framework import serializers
from .models import RequiredDocument, RequirementRule, VisaType

class RequiredDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredDocument
        fields = ['id', 'name', 'description', 'is_uploadable']

class RequirementRuleSerializer(serializers.ModelSerializer):
    required_documents = RequiredDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = RequirementRule
        fields = '__all__'
