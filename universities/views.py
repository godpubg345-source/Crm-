from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Min, Max
from decimal import Decimal
from .models import University, Course, AdmissionCriteria, CourseWishlist, LivingCostEstimate
from .serializers import (
    UniversitySerializer, UniversityListSerializer,
    CourseSerializer, CourseListSerializer,
    UniversityMatchSerializer, UniversityContactSerializer,
    UniversityDocumentSerializer, PartnershipAgreementSerializer,
    CourseWishlistSerializer, LivingCostEstimateSerializer
)
from .services import UniversityMatchingService
from .filters import CourseFilter
from accounts.permissions import UniversityPermission
from audit.mixins import AuditLogMixin


class UniversityViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for University CRUD operations.
    Universities are global master data (not branch-isolated).
    """
    queryset = University.objects.prefetch_related('courses').select_related('admission_criteria').all()
    permission_classes = [IsAuthenticated, UniversityPermission]
    
    # Enable search and filtering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'is_partner', 'is_active']
    search_fields = ['name', 'city', 'country']
    ordering_fields = ['name', 'country', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UniversityListSerializer
        if self.action == 'smart_match':
            return UniversityMatchSerializer
        return UniversitySerializer

        return Response(result)

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get contacts for a specific university."""
        university = self.get_object()
        contacts = university.key_contacts.all()
        serializer = UniversityContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get documents for a specific university."""
        university = self.get_object()
        documents = university.documents.all()
        serializer = UniversityDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request):
        """
        HQ Aggregate Analytics for University partnerships.
        """
        from django.db.models import Count, Sum
        total_partners = University.objects.filter(is_partner=True).count()
        total_universities = University.objects.count()
        countries = University.objects.values('country').annotate(count=Count('id'))
        
        # Placeholder for enrollment stats if linkable
        # This can be expanded as application logic is confirmed
        
        return Response({
            'total_partners': total_partners,
            'total_universities': total_universities,
            'geographic_reach': countries,
            'health_scores': [], # Placeholder for real algorithmic health
        })

    @action(detail=False, methods=['get'], url_path='commission-forecast')
    def commission_forecast(self, request):
        """
        Commission Intelligence: Get projected commission forecast.
        Returns summary, pipeline breakdown, and per-university commissions.
        """
        from .services import CommissionIntelligenceService
        
        forecast = CommissionIntelligenceService.get_commission_forecast()
        return Response(forecast)

    @action(detail=True, methods=['get'], url_path='commission')
    def university_commission(self, request, pk=None):
        """
        Get detailed commission data for a specific university.
        """
        from .services import CommissionIntelligenceService
        
        result = CommissionIntelligenceService.get_university_commission(pk)
        if result is None:
            return Response(
                {'error': 'University not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(result)

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        """
        Get application statistics for a specific university.
        Returns counts by status and recent applications.
        """
        from applications.models import Application
        from django.db.models import Count
        
        university = self.get_object()
        
        # Get application counts by status
        status_counts = Application.objects.filter(
            university=university
        ).values('status').annotate(count=Count('id'))
        
        # Convert to dict format
        stats = {
            'pending': 0,
            'offer': 0,
            'cas_received': 0,
            'enrolled': 0,
            'rejected': 0
        }
        
        status_mapping = {
            'PENDING': 'pending',
            'SUBMITTED': 'pending',
            'OFFER': 'offer',
            'CAS_RECEIVED': 'cas_received',
            'ENROLLED': 'enrolled',
            'REJECTED': 'rejected',
            'WITHDRAWN': 'rejected'
        }
        
        for item in status_counts:
            mapped = status_mapping.get(item['status'], 'pending')
            stats[mapped] += item['count']
        
        # Get recent applications (last 10)
        recent = Application.objects.filter(
            university=university
        ).select_related('student').order_by('-created_at')[:10]
        
        recent_data = [
            {
                'id': app.id,
                'student_name': app.student.full_name if app.student else 'Unknown',
                'course_name': app.course.name if app.course else 'General',
                'status': app.status,
                'applied_at': app.created_at.isoformat(),
                'updated_at': app.updated_at.isoformat()
            }
            for app in recent
        ]
        
        return Response({
            'university_id': university.id,
            'university_name': university.name,
            'stats': stats,
            'total': sum(stats.values()),
            'recent_applications': recent_data
        })


class CourseViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for Course CRUD operations with advanced search and eligibility matching.
    
    Features:
    - Full-text search across course name, university, department
    - Filter by price range, IELTS, intakes, work experience
    - Eligibility matching based on student profile
    - Country-specific requirements lookup
    """
    queryset = Course.objects.select_related('university').prefetch_related('country_requirements').all()
    permission_classes = [IsAuthenticated, UniversityPermission]
    
    # Enable search and filtering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['name', 'university__name', 'department']
    ordering_fields = ['name', 'tuition_fee', 'ielts_overall', 'created_at', 'university__name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer

    @action(detail=False, methods=['get'], url_path='search')
    def advanced_search(self, request):
        """
        Advanced course search with comprehensive filters.
        
        Query params:
        - q: Search term (course name, university, department)
        - min_fee, max_fee: Tuition fee range
        - level: Course level (PG, UG, etc.)
        - country: University country
        - max_ielts: Maximum IELTS requirement
        - intake_jan, intake_may, intake_sep: Boolean intake filters
        - is_partner: Filter partner universities only
        - verified_only: Only verified courses
        """
        queryset = self.get_queryset()
        
        # Apply search term
        q = request.query_params.get('q')
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(university__name__icontains=q) |
                Q(department__icontains=q)
            )
        
        # Apply filters
        min_fee = request.query_params.get('min_fee')
        max_fee = request.query_params.get('max_fee')
        if min_fee:
            queryset = queryset.filter(tuition_fee__gte=Decimal(min_fee))
        if max_fee:
            queryset = queryset.filter(tuition_fee__lte=Decimal(max_fee))
        
        level = request.query_params.get('level')
        if level:
            queryset = queryset.filter(level__iexact=level)
        
        country = request.query_params.get('country')
        if country:
            queryset = queryset.filter(university__country__iexact=country)
        
        max_ielts = request.query_params.get('max_ielts')
        if max_ielts:
            queryset = queryset.filter(
                Q(ielts_overall__lte=Decimal(max_ielts)) | Q(ielts_overall__isnull=True)
            )
        
        # Intake filters
        if request.query_params.get('intake_jan') == 'true':
            queryset = queryset.filter(intake_january=True)
        if request.query_params.get('intake_may') == 'true':
            queryset = queryset.filter(intake_may=True)
        if request.query_params.get('intake_sep') == 'true':
            queryset = queryset.filter(intake_september=True)
        
        # Partner only
        if request.query_params.get('is_partner') == 'true':
            queryset = queryset.filter(university__is_partner=True)
        
        # Verified only
        if request.query_params.get('verified_only') == 'true':
            queryset = queryset.filter(is_data_verified=True)
        
        # Pagination
        page = self.paginate_queryset(queryset.order_by('tuition_fee'))
        if page is not None:
            serializer = CourseListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CourseListSerializer(queryset[:100], many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='eligibility-match')
    def eligibility_match(self, request):
        """
        Match courses based on student eligibility profile.
        
        Request body:
        {
            "country": "PK",           # Student's country code
            "ielts_score": 6.5,        # Student's IELTS score
            "percentage": 65,          # Student's academic percentage
            "has_work_exp": false,     # Does student have work experience?
            "work_exp_years": 0,       # Years of work experience
            "level": "PG",             # Desired study level
            "max_fee": 25000,          # Maximum affordable tuition
            "intake": "sep"            # Desired intake (jan/may/sep)
        }
        
        Returns courses with eligibility status and match score.
        """
        from .models import CourseRequirement
        
        data = request.data
        country = data.get('country', 'PK').upper()
        ielts_score = Decimal(str(data.get('ielts_score', 0)))
        percentage = int(data.get('percentage', 0))
        has_work_exp = data.get('has_work_exp', False)
        work_exp_years = int(data.get('work_exp_years', 0))
        level = data.get('level', 'PG')
        max_fee = data.get('max_fee')
        intake = data.get('intake', 'sep').lower()
        
        # Start with base queryset
        queryset = Course.objects.select_related('university').prefetch_related('country_requirements')
        
        # Filter by level
        if level:
            queryset = queryset.filter(level__iexact=level)
        
        # Filter by max fee
        if max_fee:
            queryset = queryset.filter(tuition_fee__lte=Decimal(str(max_fee)))
        
        # Filter by intake
        if intake == 'jan':
            queryset = queryset.filter(intake_january=True)
        elif intake == 'may':
            queryset = queryset.filter(intake_may=True)
        elif intake == 'sep':
            queryset = queryset.filter(intake_september=True)
        
        # Filter by work experience requirement
        if not has_work_exp:
            queryset = queryset.filter(work_experience_required=False)
        
        # Partner universities only
        queryset = queryset.filter(university__is_partner=True)
        
        # Process eligibility and calculate match scores
        results = []
        for course in queryset[:200]:  # Limit for performance
            match_score = 0
            eligibility_status = 'eligible'
            issues = []
            
            # Check IELTS requirement
            if course.ielts_overall and ielts_score < course.ielts_overall:
                eligibility_status = 'conditional'
                issues.append(f"IELTS {course.ielts_overall} required, you have {ielts_score}")
            else:
                match_score += 20
            
            # Check country-specific requirements
            country_req = course.country_requirements.filter(country=country).first()
            if country_req:
                if country_req.min_percentage and percentage < country_req.min_percentage:
                    eligibility_status = 'conditional'
                    issues.append(f"Min {country_req.min_percentage}% required, you have {percentage}%")
                else:
                    match_score += 20
                
                # Check work experience
                if country_req.work_experience_required and not has_work_exp:
                    eligibility_status = 'ineligible'
                    issues.append(f"Work experience required")
                elif country_req.work_experience_years > work_exp_years:
                    eligibility_status = 'conditional'
                    issues.append(f"{country_req.work_experience_years} years experience required")
                else:
                    match_score += 20
            else:
                match_score += 40  # No specific requirements = assume eligible
            
            # Scholarship Matching (Phase 5)
            matching_s = None
            total_savings = 0
            
            university_scholarships = Scholarship.objects.filter(
                university=course.university,
                is_active=True
            )
            
            for s in university_scholarships:
                # Basic check - can we get this scholarship?
                s_eligible = True
                if s.min_cgpa and percentage < s.min_cgpa:
                    s_eligible = False
                if s.min_ielts and ielts_score < s.min_ielts:
                    s_eligible = False
                    
                if s_eligible:
                    # Calculate potential savings
                    s_savings = 0
                    if s.amount_type == 'PERCENTAGE':
                        s_savings = (course.tuition_fee * s.value) / 100
                    else:
                        s_savings = s.value
                    
                    # Keep track of the best scholarship
                    if s_savings > total_savings:
                        total_savings = s_savings
                        matching_s = {
                            'name': s.name,
                            'value': float(s.value),
                            'amount_type': s.amount_type,
                            'potential_savings': float(s_savings)
                        }
            
            if matching_s:
                match_score += 15
            
            # Bonus for partner university
            if course.university.is_partner:
                match_score += 15
            
            # Bonus for verified data
            if course.is_data_verified:
                match_score += 10
            
            results.append({
                'id': course.id,
                'name': course.name,
                'university_name': course.university.name,
                'university_city': course.university.city,
                'university_logo': request.build_absolute_uri(course.university.logo.url) if course.university.logo else None,
                'is_partner': course.university.is_partner,
                'level': course.level,
                'tuition_fee': float(course.tuition_fee),
                'currency': course.currency,
                'ielts_required': float(course.ielts_overall) if course.ielts_overall else None,
                'intakes': course.intakes,
                'official_url': course.official_url,
                'match_score': min(match_score, 100),
                'eligibility_status': eligibility_status,
                'issues': issues,
                'country_requirements': country_req.min_qualification if country_req else None,
                'matching_scholarship': matching_s,
                'total_savings': float(total_savings) if total_savings > 0 else None
            })
        
        # Sort by match score descending
        results.sort(key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            'student_profile': {
                'country': country,
                'ielts_score': float(ielts_score),
                'percentage': percentage,
                'has_work_exp': has_work_exp
            },
            'total_matches': len(results),
            'courses': results[:50]  # Return top 50 matches
        })

    @action(detail=True, methods=['get'], url_path='requirements')
    def course_requirements(self, request, pk=None):
        """
        Get country-specific requirements for a course.
        """
        from .serializers import CourseRequirementSerializer
        
        course = self.get_object()
        requirements = course.country_requirements.all()
        serializer = CourseRequirementSerializer(requirements, many=True)
        
        return Response({
            'course_id': course.id,
            'course_name': course.name,
            'university': course.university.name,
            'general_requirements': {
                'ielts_overall': float(course.ielts_overall) if course.ielts_overall else None,
                'ielts_each_band': float(course.ielts_each_band) if course.ielts_each_band else None,
                'academic_requirement': course.academic_requirement,
                'work_experience_required': course.work_experience_required,
                'work_experience_years': course.work_experience_years
            },
            'country_requirements': serializer.data
        })

    @action(detail=True, methods=['get'], url_path='check-eligibility')
    def check_eligibility(self, request, pk=None):
        """
        Check if a specific student profile is eligible for a course.
        
        Query params:
        - country: Student's country code (PK, BD, IN, NG)
        - ielts: Student's IELTS score
        - percentage: Student's academic percentage
        - work_exp: Years of work experience
        """
        course = self.get_object()
        
        country = request.query_params.get('country', 'PK').upper()
        ielts = Decimal(request.query_params.get('ielts', '0'))
        percentage = int(request.query_params.get('percentage', '0'))
        work_exp = int(request.query_params.get('work_exp', '0'))
        
        eligibility = {
            'is_eligible': True,
            'status': 'eligible',
            'issues': [],
            'recommendations': []
        }
        
        # Check IELTS
        if course.ielts_overall and ielts < course.ielts_overall:
            eligibility['is_eligible'] = False
            eligibility['status'] = 'conditional'
            eligibility['issues'].append(f"IELTS requirement: {course.ielts_overall}, you have: {ielts}")
            diff = course.ielts_overall - ielts
            eligibility['recommendations'].append(f"Improve IELTS by {diff} band(s)")
        
        # Check country-specific requirements
        country_req = course.country_requirements.filter(country=country).first()
        if country_req:
            if country_req.min_percentage and percentage < country_req.min_percentage:
                eligibility['status'] = 'conditional'
                eligibility['issues'].append(f"Min percentage: {country_req.min_percentage}%, you have: {percentage}%")
            
            if country_req.work_experience_required and work_exp < country_req.work_experience_years:
                if country_req.work_experience_years > 0:
                    eligibility['is_eligible'] = False
                    eligibility['status'] = 'ineligible'
                    eligibility['issues'].append(f"Work experience: {country_req.work_experience_years} years required")
        
        return Response({
            'course': {
                'id': course.id,
                'name': course.name,
                'university': course.university.name,
                'tuition_fee': float(course.tuition_fee)
            },
            'student_profile': {
                'country': country,
                'ielts': float(ielts),
                'percentage': percentage,
                'work_experience_years': work_exp
            },
            'eligibility': eligibility
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def course_stats(self, request):
        """
        Get course statistics for dashboard.
        """
        from django.db.models import Avg, Min, Max, Count
        
        stats = Course.objects.aggregate(
            total_courses=Count('id'),
            avg_fee=Avg('tuition_fee'),
            min_fee=Min('tuition_fee'),
            max_fee=Max('tuition_fee'),
            avg_ielts=Avg('ielts_overall')
        )
        
        # Courses by level
        by_level = Course.objects.values('level').annotate(count=Count('id'))
        
        # Partner university courses
        partner_courses = Course.objects.filter(university__is_partner=True).count()
        
        # Verified courses
        verified_courses = Course.objects.filter(is_data_verified=True).count()
        
        return Response({
            'total_courses': stats['total_courses'],
            'average_fee': round(float(stats['avg_fee'] or 0), 2),
            'fee_range': {
                'min': float(stats['min_fee'] or 0),
                'max': float(stats['max_fee'] or 0)
            },
            'average_ielts': round(float(stats['avg_ielts'] or 0), 1),
            'partner_courses': partner_courses,
            'verified_courses': verified_courses,
            'by_level': list(by_level)
        })

    @action(detail=False, methods=['get'], url_path='compare')
    def compare_courses(self, request):
        """
        Compare multiple courses side-by-side.
        
        Query params:
        - ids: Comma-separated course IDs (max 4)
        
        Returns detailed comparison with best/worst indicators.
        """
        ids_param = request.query_params.get('ids', '')
        if not ids_param:
            return Response({'error': 'No course IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course_ids = [int(id.strip()) for id in ids_param.split(',')][:4]
        except ValueError:
            return Response({'error': 'Invalid course ID format'}, status=status.HTTP_400_BAD_REQUEST)
        
        courses = Course.objects.filter(id__in=course_ids).select_related('university').prefetch_related('country_requirements')
        
        if not courses.exists():
            return Response({'error': 'No courses found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Build comparison data
        comparison_data = []
        fees = []
        ielts_scores = []
        
        for course in courses:
            fees.append(float(course.tuition_fee))
            if course.ielts_overall:
                ielts_scores.append(float(course.ielts_overall))
            
            country_reqs = {}
            for req in course.country_requirements.all():
                country_reqs[req.country] = {
                    'min_percentage': req.min_percentage,
                    'min_qualification': req.min_qualification,
                    'ielts_overall': float(req.ielts_overall) if req.ielts_overall else None,
                    'work_experience_years': req.work_experience_years
                }
            
            comparison_data.append({
                'id': course.id,
                'name': course.name,
                'university_name': course.university.name,
                'university_city': course.university.city,
                'university_country': course.university.country,
                'is_partner': course.university.is_partner,
                'level': course.level,
                'duration': course.duration,
                'tuition_fee': float(course.tuition_fee),
                'currency': course.currency,
                'ielts_overall': float(course.ielts_overall) if course.ielts_overall else None,
                'ielts_each_band': float(course.ielts_each_band) if course.ielts_each_band else None,
                'intakes': course.intakes,
                'intake_january': course.intake_january,
                'intake_may': course.intake_may,
                'intake_september': course.intake_september,
                'work_experience_required': course.work_experience_required,
                'work_experience_years': course.work_experience_years,
                'official_url': course.official_url,
                'is_data_verified': course.is_data_verified,
                'country_requirements': country_reqs
            })
        
        # Calculate best/worst indicators
        best_fee = min(fees) if fees else None
        worst_fee = max(fees) if fees else None
        best_ielts = min(ielts_scores) if ielts_scores else None
        worst_ielts = max(ielts_scores) if ielts_scores else None
        
        # Add indicators to each course
        for course in comparison_data:
            course['indicators'] = {
                'best_fee': course['tuition_fee'] == best_fee if best_fee else False,
                'worst_fee': course['tuition_fee'] == worst_fee if worst_fee else False,
                'easiest_ielts': course['ielts_overall'] == best_ielts if best_ielts and course['ielts_overall'] else False,
                'hardest_ielts': course['ielts_overall'] == worst_ielts if worst_ielts and course['ielts_overall'] else False,
                'is_partner': course['is_partner']
            }
        
        return Response({
            'count': len(comparison_data),
            'courses': comparison_data,
            'summary': {
                'fee_range': {'min': best_fee, 'max': worst_fee},
                'ielts_range': {'min': best_ielts, 'max': worst_ielts}
            }
        })

    @action(detail=True, methods=['get'], url_path='scholarships')
    def course_scholarships(self, request, pk=None):
        """
        Get available scholarships for a specific course with eligibility check.
        """
        from .serializers import ScholarshipSerializer
        
        course = self.get_object()
        university = course.university
        
        # Get all scholarships for this university
        scholarships = Scholarship.objects.filter(
            university=university,
            is_active=True
        )
        
        # Student profile from query params
        cgpa = request.query_params.get('cgpa')
        ielts = request.query_params.get('ielts')
        percentage = request.query_params.get('percentage')
        
        # Use percentage as cgpa if cgpa is missing (common in some regions)
        score = Decimal(cgpa) if cgpa else (Decimal(percentage) if percentage else None)
        ielts_score = Decimal(ielts) if ielts else None
        
        scholarship_list = []
        for scholarship in scholarships:
            eligibility = 'eligible'
            notes = []
            
            # Check academic requirement
            if score and scholarship.min_cgpa:
                if score < scholarship.min_cgpa:
                    eligibility = 'conditional'
                    notes.append(f'Requires {scholarship.min_cgpa}% minimum, you have {score}%')
            
            # Check IELTS requirement
            if ielts_score and scholarship.min_ielts:
                if ielts_score < scholarship.min_ielts:
                    eligibility = 'conditional'
                    notes.append(f'Requires {scholarship.min_ielts} IELTS, you have {ielts_score}')
            
            # Calculate potential savings
            potential_savings = 0
            if scholarship.amount_type == 'PERCENTAGE':
                potential_savings = (course.tuition_fee * scholarship.value) / 100
            else:
                potential_savings = scholarship.value
                
            serializer = ScholarshipSerializer(scholarship)
            s_data = serializer.data
            s_data.update({
                'eligibility_status': eligibility,
                'notes': notes,
                'potential_savings': float(potential_savings)
            })
            scholarship_list.append(s_data)
        
        return Response({
            'course_id': course.id,
            'course_name': course.name,
            'university': university.name,
            'tuition_fee': float(course.tuition_fee),
            'scholarships': scholarship_list,
            'total_available': len([s for s in scholarship_list if s['eligibility_status'] == 'eligible']),
            'student_profile': {
                'score': float(score) if score else None,
                'ielts': float(ielts_score) if ielts_score else None
            }
        })

    @action(detail=True, methods=['get'], url_path='documents')
    def document_checklist(self, request, pk=None):
        """
        Get document requirements for a specific course.
        
        Returns a checklist of required documents based on
        the course level and student's country.
        """
        course = self.get_object()
        country = request.query_params.get('country', 'PK')
        
        # Base documents for all applications
        base_documents = [
            {'name': 'Valid Passport', 'category': 'Identity', 'required': True, 'notes': 'Must be valid for duration of study + 6 months'},
            {'name': 'Passport Photos', 'category': 'Identity', 'required': True, 'notes': '2 passport-sized photographs'},
            {'name': 'Academic Transcripts', 'category': 'Academic', 'required': True, 'notes': 'All previous education transcripts'},
            {'name': 'Degree Certificate', 'category': 'Academic', 'required': True, 'notes': 'Original or certified copy'},
            {'name': 'English Language Test', 'category': 'Language', 'required': True, 'notes': f'IELTS {course.ielts_overall or 6.0} or equivalent'},
            {'name': 'Statement of Purpose', 'category': 'Application', 'required': True, 'notes': 'Personal statement explaining motivation'},
            {'name': 'CV/Resume', 'category': 'Application', 'required': True, 'notes': 'Updated curriculum vitae'},
            {'name': 'Reference Letters', 'category': 'Application', 'required': True, 'notes': '2 academic or professional references'},
        ]
        
        # Country-specific requirements
        country_specific = []
        if country == 'PK':
            country_specific = [
                {'name': 'B-Form / CNIC Copy', 'category': 'Identity', 'required': True, 'notes': 'National ID card'},
                {'name': 'Police Character Certificate', 'category': 'Legal', 'required': True, 'notes': 'Criminal record check'},
                {'name': 'TB Test Certificate', 'category': 'Medical', 'required': True, 'notes': 'Required for UK visa from Pakistan'},
            ]
        elif country == 'IN':
            country_specific = [
                {'name': 'Aadhaar Card', 'category': 'Identity', 'required': True, 'notes': 'National ID'},
                {'name': 'Police Clearance Certificate', 'category': 'Legal', 'required': True, 'notes': 'From local police station'},
                {'name': 'TB Test Certificate', 'category': 'Medical', 'required': True, 'notes': 'Required for UK visa'},
            ]
        elif country == 'BD':
            country_specific = [
                {'name': 'National ID Card', 'category': 'Identity', 'required': True, 'notes': 'NID card'},
                {'name': 'Police Clearance', 'category': 'Legal', 'required': True, 'notes': 'From police headquarters'},
                {'name': 'TB Test Certificate', 'category': 'Medical', 'required': True, 'notes': 'Required for UK visa'},
            ]
        elif country == 'NG':
            country_specific = [
                {'name': 'Nigerian Passport Data Page', 'category': 'Identity', 'required': True, 'notes': 'Clear copy'},
                {'name': 'Police Character Certificate', 'category': 'Legal', 'required': True, 'notes': 'From NPF'},
                {'name': 'TB Test Certificate', 'category': 'Medical', 'required': True, 'notes': 'Required for UK visa'},
            ]
        
        # Level-specific requirements
        level_specific = []
        if course.level == 'PG':
            level_specific = [
                {'name': 'Bachelor\'s Degree', 'category': 'Academic', 'required': True, 'notes': 'Original degree certificate'},
                {'name': 'Work Experience Letter', 'category': 'Professional', 'required': course.work_experience_required, 'notes': f'{course.work_experience_years or 0}+ years required' if course.work_experience_required else 'Optional'},
            ]
        elif course.level == 'UG':
            level_specific = [
                {'name': 'High School Certificate', 'category': 'Academic', 'required': True, 'notes': 'A-Levels, FSc, or equivalent'},
            ]
        elif course.level == 'FND':
            level_specific = [
                {'name': 'O-Levels/Matric Certificate', 'category': 'Academic', 'required': True, 'notes': 'Secondary education certificate'},
            ]
        
        # Financial documents
        financial_documents = [
            {'name': 'Bank Statements', 'category': 'Financial', 'required': True, 'notes': 'Last 6 months, showing sufficient funds'},
            {'name': 'Sponsorship Letter', 'category': 'Financial', 'required': False, 'notes': 'If sponsored by family/institution'},
            {'name': 'Scholarship Letter', 'category': 'Financial', 'required': False, 'notes': 'If awarded scholarship'},
        ]
        
        all_documents = base_documents + country_specific + level_specific + financial_documents
        
        return Response({
            'course_id': course.id,
            'course_name': course.name,
            'university': course.university.name,
            'level': course.level,
            'country': country,
            'documents': all_documents,
            'total_required': len([d for d in all_documents if d['required']]),
            'categories': list(set(d['category'] for d in all_documents))
        })

    @action(detail=False, methods=['get'], url_path='calendar')
    def intake_calendar(self, request):
        """
        Get intake dates for courses in a calendar format.
        
        Query params:
        - year: Filter by year (default: current + next year)
        - month: Filter by specific month
        - university: Filter by university ID
        - level: Filter by course level
        """
        from django.utils import timezone
        from .models import IntakeDate
        
        current_year = timezone.now().year
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        university_id = request.query_params.get('university')
        level = request.query_params.get('level')
        
        # Base queryset
        queryset = IntakeDate.objects.filter(
            is_active=True
        ).select_related('course__university')
        
        # Apply filters
        if year:
            queryset = queryset.filter(year=int(year))
        else:
            queryset = queryset.filter(year__in=[current_year, current_year + 1])
        
        if month:
            queryset = queryset.filter(month__iexact=month)
        
        if university_id:
            queryset = queryset.filter(course__university_id=university_id)
        
        if level:
            queryset = queryset.filter(course__level__iexact=level)
        
        # Group by month/year
        calendar_data = {}
        for intake in queryset:
            key = f"{intake.month} {intake.year}"
            if key not in calendar_data:
                calendar_data[key] = {
                    'month': intake.month,
                    'year': intake.year,
                    'courses': []
                }
            
            calendar_data[key]['courses'].append({
                'id': intake.course.id,
                'name': intake.course.name,
                'university': intake.course.university.name,
                'level': intake.course.level,
                'deadline': intake.deadline.isoformat() if intake.deadline else None,
                'tuition_fee': float(intake.course.tuition_fee)
            })
        
        # Sort by date
        sorted_calendar = sorted(
            calendar_data.values(),
            key=lambda x: (x['year'], ['January', 'February', 'March', 'April', 'May', 'June', 
                                        'July', 'August', 'September', 'October', 'November', 'December'].index(x['month']) if x['month'] in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] else 0)
        )
        
        return Response({
            'calendar': sorted_calendar,
            'total_intakes': sum(len(m['courses']) for m in sorted_calendar)
        })

    @action(detail=False, methods=['post'], url_path='recommendations')
    def ai_recommendations(self, request):
        """
        AI-powered course recommendations based on student profile.
        
        Request body:
        {
            "ielts_score": 6.5,
            "percentage": 65,
            "budget": 20000,
            "country": "PK",
            "preferred_level": "PG",
            "preferred_country": "UK",
            "has_work_experience": true,
            "work_exp_years": 2,
            "interests": ["data science", "AI", "machine learning"]
        }
        """
        from django.db.models import Avg, Count, F, Value, FloatField
        from django.db.models.functions import Coalesce
        
        # Extract profile from request
        ielts_score = request.data.get('ielts_score', 6.0)
        percentage = request.data.get('percentage', 60)
        budget = request.data.get('budget', 25000)
        country = request.data.get('country', 'PK')
        preferred_level = request.data.get('preferred_level', '')
        preferred_country = request.data.get('preferred_country', 'UK')
        has_work_exp = request.data.get('has_work_experience', False)
        work_exp_years = request.data.get('work_exp_years', 0)
        interests = request.data.get('interests', [])
        
        # Base queryset - active courses within budget
        queryset = Course.objects.filter(
            is_active=True,
            tuition_fee__lte=budget
        ).select_related('university')
        
        # Filter by preferred country if specified
        if preferred_country:
            queryset = queryset.filter(university__country__iexact=preferred_country)
        
        # Filter by level if specified
        if preferred_level:
            queryset = queryset.filter(level__iexact=preferred_level)
        
        # Calculate match scores
        recommendations = []
        for course in queryset[:100]:  # Limit for performance
            score = 0
            reasons = []
            
            # IELTS match (max 25 points)
            if course.ielts_overall:
                if ielts_score >= float(course.ielts_overall):
                    ielts_margin = ielts_score - float(course.ielts_overall)
                    score += min(25, 15 + (ielts_margin * 5))
                    if ielts_margin >= 0.5:
                        reasons.append("✓ Strong IELTS match")
                else:
                    score -= 10  # Penalty for not meeting requirement
            else:
                score += 15  # Default if no requirement specified
            
            # Budget fit (max 25 points)
            fee = float(course.tuition_fee)
            if fee <= budget * 0.7:
                score += 25
                reasons.append("✓ Well within budget")
            elif fee <= budget * 0.9:
                score += 20
                reasons.append("✓ Good budget fit")
            else:
                score += 10
            
            # Partner university bonus (max 15 points)
            if course.university.is_partner:
                score += 15
                reasons.append("✓ Partner university (faster processing)")
            
            # Work experience match (max 10 points)
            if course.work_experience_required:
                if has_work_exp and work_exp_years >= course.work_experience_years:
                    score += 10
                    reasons.append("✓ Work experience requirement met")
                else:
                    score -= 15  # Penalty for not meeting requirement
            else:
                score += 5  # Bonus for no work experience requirement
            
            # Interest matching (max 15 points)
            if interests:
                course_text = f"{course.name} {course.department or ''}".lower()
                matched = sum(1 for i in interests if i.lower() in course_text)
                if matched > 0:
                    score += min(15, matched * 5)
                    reasons.append(f"✓ Matches {matched} interest(s)")
            
            # Data quality bonus (max 10 points)
            if course.is_data_verified:
                score += 5
                reasons.append("✓ Verified data")
            if course.official_url:
                score += 5
            
            # Get review stats
            avg_rating = None
            review_count = 0
            try:
                from .models import CourseReview
                review_stats = CourseReview.objects.filter(
                    course=course, is_approved=True
                ).aggregate(Avg('overall_rating'), Count('id'))
                avg_rating = review_stats['overall_rating__avg']
                review_count = review_stats['id__count']
                if avg_rating and avg_rating >= 4:
                    score += 10
                    reasons.append(f"✓ Highly rated ({avg_rating:.1f}★)")
            except:
                pass
            
            # Get career paths
            career_paths = []
            try:
                from .models import CareerPath
                careers = CareerPath.objects.filter(courses=course, is_active=True)[:3]
                career_paths = [
                    {'name': c.name, 'salary_median': c.salary_median}
                    for c in careers
                ]
            except:
                pass
            
            recommendations.append({
                'id': course.id,
                'name': course.name,
                'university': course.university.name,
                'university_country': course.university.country,
                'level': course.level,
                'tuition_fee': fee,
                'currency': course.currency,
                'duration': course.duration,
                'ielts_overall': float(course.ielts_overall) if course.ielts_overall else None,
                'is_partner': course.university.is_partner,
                'match_score': max(0, score),
                'match_percentage': min(100, max(0, score)),
                'reasons': reasons,
                'avg_rating': round(avg_rating, 1) if avg_rating else None,
                'review_count': review_count,
                'career_paths': career_paths
            })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top 20 recommendations
        return Response({
            'profile': {
                'ielts_score': ielts_score,
                'percentage': percentage,
                'budget': budget,
                'country': country,
                'level': preferred_level,
                'work_experience': work_exp_years if has_work_exp else 0
            },
            'total_matches': len(recommendations),
            'recommendations': recommendations[:20],
            'message': f"Found {len(recommendations)} courses matching your profile"
        })



class CourseWishlistViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing saved/bookmarked courses.
    Users can save courses to their wishlist for later review.
    """
    serializer_class = CourseWishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only the current user's wishlist."""
        return CourseWishlist.objects.filter(
            user=self.request.user
        ).select_related('course__university')
    
    def perform_create(self, serializer):
        """Auto-assign the current user when creating wishlist entry."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='check/(?P<course_id>[0-9]+)')
    def check_saved(self, request, course_id=None):
        """Check if a specific course is in user's wishlist."""
        is_saved = self.get_queryset().filter(course_id=course_id).exists()
        return Response({'is_saved': is_saved})
    
    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle_wishlist(self, request):
        """Toggle a course in/out of wishlist."""
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        existing = self.get_queryset().filter(course_id=course_id).first()
        if existing:
            existing.delete()
            return Response({'status': 'removed', 'is_saved': False})
        else:
            try:
                course = Course.objects.get(id=course_id)
                CourseWishlist.objects.create(user=request.user, course=course)
                return Response({'status': 'added', 'is_saved': True})
            except Course.DoesNotExist:
                return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


class LivingCostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for living cost estimates.
    Used for the cost calculator feature.
    """
    queryset = LivingCostEstimate.objects.all()
    serializer_class = LivingCostEstimateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['city', 'country']
    
    @action(detail=False, methods=['post'], url_path='calculate')
    def calculate_total_cost(self, request):
        """
        Calculate total study cost for a course.
        
        Request body:
        - course_id: Course ID
        - duration_years: Study duration (default 1)
        - currency: Target currency for conversion (PKR, BDT, INR, NGN)
        """
        course_id = request.data.get('course_id')
        duration_years = float(request.data.get('duration_years', 1))
        target_currency = request.data.get('currency', 'GBP')
        
        if not course_id:
            return Response({'error': 'course_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.select_related('university').get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get living costs for the city
        city = course.university.city
        living_costs = LivingCostEstimate.objects.filter(city=city).first()
        
        # Use default UK costs if city-specific not found
        if not living_costs:
            living_costs = LivingCostEstimate.objects.filter(country='UK').first()
        
        # Currency conversion rates (approximate)
        conversion_rates = {
            'GBP': 1,
            'PKR': 350,
            'BDT': 130,
            'INR': 105,
            'NGN': 1600,
            'USD': 1.25,
            'EUR': 1.15
        }
        rate = conversion_rates.get(target_currency, 1)
        
        tuition_total = float(course.tuition_fee) * duration_years
        
        if living_costs:
            monthly_living = float(living_costs.monthly_total)
            living_total = monthly_living * 12 * duration_years
            visa_fee = float(living_costs.visa_fee)
            ihs_total = float(living_costs.ihs_per_year) * duration_years
        else:
            living_total = 12000 * duration_years  # Default estimate
            visa_fee = 490
            ihs_total = 776 * duration_years
        
        grand_total = tuition_total + living_total + visa_fee + ihs_total
        
        return Response({
            'course': {
                'id': course.id,
                'name': course.name,
                'university': course.university.name,
                'city': city
            },
            'breakdown': {
                'tuition': {
                    'gbp': tuition_total,
                    'converted': round(tuition_total * rate, 2)
                },
                'living_costs': {
                    'monthly_gbp': monthly_living if living_costs else 1000,
                    'total_gbp': living_total,
                    'converted': round(living_total * rate, 2)
                },
                'visa_fee': {
                    'gbp': visa_fee,
                    'converted': round(visa_fee * rate, 2)
                },
                'health_surcharge': {
                    'gbp': ihs_total,
                    'converted': round(ihs_total * rate, 2)
                }
            },
            'grand_total': {
                'gbp': round(grand_total, 2),
                'converted': round(grand_total * rate, 2),
                'currency': target_currency
            },
            'duration_years': duration_years,
            'exchange_rate': rate
        })


# =========================================================================
# PHASE 3-4: Reviews, Career Paths, Quick Apply, AI Recommendations
# =========================================================================
from .models import CourseReview, CareerPath, CourseQuickApply
from .serializers import (
    CourseReviewSerializer, CourseReviewCreateSerializer,
    CareerPathSerializer, CourseQuickApplySerializer
)


class CourseReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for course reviews and ratings.
    Users can submit reviews for courses they've studied.
    """
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return approved reviews, or user's own reviews."""
        queryset = CourseReview.objects.select_related('course__university', 'user')
        
        # If user is authenticated, show all approved + their own
        if self.request.user.is_authenticated:
            queryset = queryset.filter(
                Q(is_approved=True) | Q(user=self.request.user)
            )
        else:
            queryset = queryset.filter(is_approved=True)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseReviewCreateSerializer
        return CourseReviewSerializer
    
    def perform_create(self, serializer):
        """Auto-assign the current user when creating a review."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='course/(?P<course_id>[0-9]+)')
    def course_reviews(self, request, course_id=None):
        """Get all reviews for a specific course with stats."""
        from django.db.models import Avg, Count
        
        reviews = CourseReview.objects.filter(
            course_id=course_id,
            is_approved=True
        )
        
        stats = reviews.aggregate(
            avg_overall=Avg('overall_rating'),
            avg_teaching=Avg('teaching_quality'),
            avg_career=Avg('career_prospects'),
            avg_value=Avg('value_for_money'),
            avg_content=Avg('course_content'),
            total=Count('id')
        )
        
        # Rating distribution
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = reviews.filter(overall_rating=i).count()
        
        serializer = CourseReviewSerializer(reviews[:20], many=True)
        
        return Response({
            'stats': {
                'average_rating': round(stats['avg_overall'], 1) if stats['avg_overall'] else None,
                'teaching_quality': round(stats['avg_teaching'], 1) if stats['avg_teaching'] else None,
                'career_prospects': round(stats['avg_career'], 1) if stats['avg_career'] else None,
                'value_for_money': round(stats['avg_value'], 1) if stats['avg_value'] else None,
                'course_content': round(stats['avg_content'], 1) if stats['avg_content'] else None,
                'total_reviews': stats['total']
            },
            'distribution': distribution,
            'reviews': serializer.data
        })
    
    @action(detail=True, methods=['post'], url_path='helpful')
    def mark_helpful(self, request, pk=None):
        """Mark a review as helpful."""
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})


class CareerPathViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for career paths and outcomes.
    Read-only - managed by admin.
    """
    serializer_class = CareerPathSerializer
    queryset = CareerPath.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='by-sector')
    def by_sector(self, request):
        """Get career paths grouped by sector."""
        from django.db.models import Count
        
        sectors = {}
        for career in self.queryset.prefetch_related('courses'):
            sector = career.get_sector_display()
            if sector not in sectors:
                sectors[sector] = []
            sectors[sector].append(CareerPathSerializer(career).data)
        
        return Response(sectors)
    
    @action(detail=False, methods=['get'], url_path='for-course/(?P<course_id>[0-9]+)')
    def for_course(self, request, course_id=None):
        """Get career paths linked to a specific course."""
        careers = self.queryset.filter(courses__id=course_id)
        return Response(CareerPathSerializer(careers, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='top-salaries')
    def top_salaries(self, request):
        """Get careers with highest salary potential."""
        careers = self.queryset.filter(
            salary_median__isnull=False
        ).order_by('-salary_median')[:15]
        return Response(CareerPathSerializer(careers, many=True).data)


class CourseQuickApplyViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    ViewSet for quick apply submissions from Course Finder.
    """
    serializer_class = CourseQuickApplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return quick applies - staff sees all, users see their own."""
        user = self.request.user
        queryset = CourseQuickApply.objects.select_related(
            'course__university', 'student', 'converted_application'
        )
        
        if hasattr(user, 'role') and user.role in ['SUPER_ADMIN', 'COUNTRY_MANAGER', 'BRANCH_MANAGER', 'COUNSELOR']:
            # Staff can see all for their branch
            if hasattr(user, 'branch') and user.branch:
                return queryset.filter(branch=user.branch)
            return queryset
        
        # Regular users see their own submissions
        return queryset.filter(
            Q(student__user=user) | Q(guest_email=user.email)
        )
    
    def perform_create(self, serializer):
        """Auto-populate from logged-in user's student profile if available."""
        user = self.request.user
        student = None
        
        # Check if user has a student profile
        try:
            from students.models import Student
            student = Student.objects.get(user=user)
        except:
            pass
        
        # Get client IP
        x_forwarded = self.request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded.split(',')[0] if x_forwarded else self.request.META.get('REMOTE_ADDR')
        
        serializer.save(
            student=student,
            ip_address=ip,
            branch=getattr(user, 'branch', None)
        )
    
    @action(detail=True, methods=['post'], url_path='convert')
    def convert_to_application(self, request, pk=None):
        """Convert a quick apply to a full application."""
        quick_apply = self.get_object()
        
        if quick_apply.status == 'CONVERTED':
            return Response(
                {'error': 'Already converted to application'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from applications.models import Application
        
        # Create the application
        application = Application.objects.create(
            student=quick_apply.student,
            university=quick_apply.course.university,
            course=quick_apply.course,
            status='DRAFT',
            intake=quick_apply.preferred_intake,
            branch=quick_apply.branch,
            notes=f"Converted from Quick Apply. Message: {quick_apply.message or 'N/A'}"
        )
        
        # Update quick apply status
        quick_apply.status = 'CONVERTED'
        quick_apply.converted_application = application
        quick_apply.save()
        
        return Response({
            'message': 'Successfully converted to application',
            'application_id': application.id
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def submission_stats(self, request):
        """Get quick apply statistics for dashboard."""
        from django.db.models import Count
        
        queryset = self.get_queryset()
        
        stats = queryset.aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status='NEW')),
            contacted=Count('id', filter=Q(status='CONTACTED')),
            converted=Count('id', filter=Q(status='CONVERTED'))
        )
        
        # By course popularity
        popular_courses = queryset.values(
            'course__name', 'course__university__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'stats': stats,
            'popular_courses': list(popular_courses)
        })


# AI Recommendations endpoint - added to CourseViewSet
# (This would be added as @action in CourseViewSet)

