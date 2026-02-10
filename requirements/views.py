from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import RequirementRule, VisaType, RequiredDocument

class RequirementsCheckView(APIView):
    """
    API to check visa requirements.
    """
    def get(self, request):
        destination = request.query_params.get('destination') or request.query_params.get('country')
        origin = request.query_params.get('origin') or request.query_params.get('nationality')
        visa_type_name = request.query_params.get('visa_type', 'Student') # Default to Student

        if not destination:
            return Response({'error': 'Destination is required'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get Visa Type
        try:
            visa_type = VisaType.objects.get(name__iexact=visa_type_name)
        except VisaType.DoesNotExist:
             return Response({'error': f'Visa Type {visa_type_name} not found'}, status=status.HTTP_404_NOT_FOUND)

        # 2. Find Rules
        rules = RequirementRule.objects.filter(
            visa_type=visa_type,
            destination_country__iexact=destination,
            is_mandatory=True
        ).filter(
            Q(origin_country__isnull=True) | Q(origin_country__iexact=origin) | Q(origin_country='')
        )

        required_docs = []
        seen_ids = set()

        for rule in rules:
            # Get documents for this rule (ManyToMany)
            docs = rule.required_documents.all()
            for doc in docs:
                if doc.id not in seen_ids:
                    required_docs.append({
                        'id': doc.id,
                        'name': doc.name,
                        'description': doc.description or doc.name,
                        'is_mandatory': rule.is_mandatory,
                        'origin_country': rule.origin_country,
                        'notes': rule.notes,
                        'status': 'pending'   # Default status
                    })
                    seen_ids.add(doc.id)

        return Response(required_docs, status=status.HTTP_200_OK)
