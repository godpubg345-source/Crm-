from rest_framework import serializers
from .models import (
    University, Course, AdmissionCriteria, Scholarship,
    PartnershipAgreement, UniversityContact, UniversityDocument, IntakeDate,
    CourseRequirement, CourseWishlist, LivingCostEstimate
)


class CourseRequirementSerializer(serializers.ModelSerializer):
    """Serializer for country-specific course requirements."""
    country_display = serializers.CharField(source='get_country_display', read_only=True)
    
    class Meta:
        model = CourseRequirement
        fields = [
            'id', 'country', 'country_display',
            'min_qualification', 'accepted_qualifications',
            'min_gpa', 'min_percentage', 'min_cgpa',
            'ielts_overall', 'ielts_speaking', 'ielts_writing', 
            'ielts_reading', 'ielts_listening',
            'toefl_score', 'pte_score', 'duolingo_score',
            'work_experience_required', 'work_experience_years',
            'required_documents', 'additional_notes'
        ]


class AdmissionCriteriaSerializer(serializers.ModelSerializer):
    """Serializer for Admission Criteria (nested in University)."""
    priority_badge = serializers.SerializerMethodField()
    
    class Meta:
        model = AdmissionCriteria
        fields = [
            'min_percentage', 'min_ielts', 'gap_limit', 
            'priority_rank', 'priority_badge', 'accepted_territories'
        ]
    
    def get_priority_badge(self, obj):
        """Convert priority_rank to a human-readable badge."""
        rank = obj.priority_rank
        if rank == 1:
            return "Super High Priority"
        elif rank == 2:
            return "High Priority"
        elif rank == 3:
            return "Medium Priority"
        else:
            return "Standard"


class IntakeDateSerializer(serializers.ModelSerializer):
    """Serializer for Intake Periods."""
    class Meta:
        model = IntakeDate
        fields = ['id', 'month', 'year', 'deadline', 'is_active']


class CourseSerializer(serializers.ModelSerializer):
    """Full serializer for Course model."""
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_country = serializers.CharField(source='university.country', read_only=True)
    university_logo = serializers.ImageField(source='university.logo', read_only=True)
    university_city = serializers.CharField(source='university.city', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)
    intake_dates = IntakeDateSerializer(many=True, read_only=True)
    country_requirements = CourseRequirementSerializer(many=True, read_only=True)
    data_source_display = serializers.CharField(source='get_data_source_display', read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Course listings."""
    university_name = serializers.CharField(source='university.name', read_only=True)
    university_country = serializers.CharField(source='university.country', read_only=True)
    university_city = serializers.CharField(source='university.city', read_only=True)
    university_logo = serializers.ImageField(source='university.logo', read_only=True)
    is_partner = serializers.BooleanField(source='university.is_partner', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'university', 'university_name',
            'university_country', 'university_city', 'university_logo',
            'is_partner', 'level', 'level_display', 'duration', 
            'tuition_fee', 'currency', 'intakes',
            'ielts_overall', 'ielts_each_band',
            'intake_january', 'intake_may', 'intake_september',
            'official_url', 'is_data_verified'
        ]


class PartnershipAgreementSerializer(serializers.ModelSerializer):
    """Serializer for Partnership Agreement."""
    is_active = serializers.BooleanField(source='is_active_contract', read_only=True)
    
    class Meta:
        model = PartnershipAgreement
        fields = [
            'id', 'start_date', 'end_date', 'commission_percentage',
            'flat_fee', 'is_exclusive', 'terms_conditions', 'is_active'
        ]


class UniversityContactSerializer(serializers.ModelSerializer):
    """Serializer for University Contacts."""
    class Meta:
        model = UniversityContact
        fields = ['id', 'name', 'role', 'email', 'phone', 'linkedin', 'is_primary']


class UniversityDocumentSerializer(serializers.ModelSerializer):
    """Serializer for University Documents."""
    class Meta:
        model = UniversityDocument
        fields = ['id', 'title', 'document_type', 'file', 'uploaded_at']


class UniversitySerializer(serializers.ModelSerializer):
    """Full serializer for University model."""
    country_display = serializers.CharField(source='get_country_display', read_only=True)
    courses = CourseListSerializer(many=True, read_only=True)
    course_count = serializers.SerializerMethodField()
    admission_criteria = AdmissionCriteriaSerializer(read_only=True)
    
    class Meta:
        model = University
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    partnership_agreement = PartnershipAgreementSerializer(read_only=True)
    contacts = UniversityContactSerializer(many=True, read_only=True, source='key_contacts')
    documents = UniversityDocumentSerializer(many=True, read_only=True)
    
    def get_course_count(self, obj):
        return obj.courses.count()


class UniversityListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for University listings."""
    country_display = serializers.CharField(source='get_country_display', read_only=True)
    course_count = serializers.SerializerMethodField()
    admission_criteria = AdmissionCriteriaSerializer(read_only=True)
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'country', 'country_display', 
            'city', 'is_partner', 'website', 'logo',
            'course_count', 'is_active', 'admission_criteria'
        ]
    
    def get_course_count(self, obj):
        return obj.courses.count()



class ScholarshipSerializer(serializers.ModelSerializer):
    """Serializer for Scholarships."""
    amount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Scholarship
        fields = [
            'id', 'name', 'description', 'amount_type', 
            'value', 'amount_display', 'min_cgpa', 
            'min_ielts', 'deadline'
        ]
        
    def get_amount_display(self, obj):
        if obj.amount_type == 'PERCENTAGE':
            return f"{obj.value}%"
        return f"{obj.value}"


class UniversityMatchSerializer(serializers.ModelSerializer):
    """Serializer for Smart Match results with match score."""
    country_display = serializers.CharField(source='get_country_display', read_only=True)
    admission_criteria = AdmissionCriteriaSerializer(read_only=True)
    match_score = serializers.IntegerField(read_only=True)
    priority_badge = serializers.SerializerMethodField()
    scholarships = ScholarshipSerializer(many=True, read_only=True, source='matched_scholarships')
    
    class Meta:
        model = University
        fields = [
            'id', 'name', 'country', 'country_display', 
            'city', 'logo', 'website', 'is_partner',
            'admission_criteria', 'match_score', 'priority_badge',
            'scholarships'
        ]
    
    def get_priority_badge(self, obj):
        if hasattr(obj, 'admission_criteria') and obj.admission_criteria:
            rank = obj.admission_criteria.priority_rank
            if rank == 1:
                return "⭐ Super High Priority"
            elif rank == 2:
                return "🔥 High Priority"
            elif rank == 3:
                return "✅ Medium Priority"
        return "📌 Standard"


class CourseWishlistSerializer(serializers.ModelSerializer):
    """Serializer for saved/bookmarked courses."""
    course_name = serializers.CharField(source='course.name', read_only=True)
    university_name = serializers.CharField(source='course.university.name', read_only=True)
    university_city = serializers.CharField(source='course.university.city', read_only=True)
    tuition_fee = serializers.DecimalField(source='course.tuition_fee', read_only=True, max_digits=10, decimal_places=2)
    currency = serializers.CharField(source='course.currency', read_only=True)
    level = serializers.CharField(source='course.level', read_only=True)
    is_partner = serializers.BooleanField(source='course.university.is_partner', read_only=True)
    
    class Meta:
        model = CourseWishlist
        fields = [
            'id', 'course', 'course_name', 'university_name', 'university_city',
            'tuition_fee', 'currency', 'level', 'is_partner', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LivingCostEstimateSerializer(serializers.ModelSerializer):
    """Serializer for city living cost estimates."""
    monthly_total = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    
    class Meta:
        model = LivingCostEstimate
        fields = [
            'id', 'city', 'country', 'currency',
            'monthly_rent', 'monthly_food', 'monthly_transport',
            'monthly_utilities', 'monthly_other', 'monthly_total',
            'visa_fee', 'ihs_per_year', 'notes', 'last_updated'
        ]


# =========================================================================
# PHASE 3-4: Reviews, Career Paths, Quick Apply
# =========================================================================
from .models import CourseReview, CareerPath, CourseQuickApply


class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for course reviews and ratings."""
    user_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = CourseReview
        fields = [
            'id', 'course', 'course_name', 'user', 'user_name',
            'overall_rating', 'teaching_quality', 'career_prospects',
            'value_for_money', 'course_content',
            'title', 'review_text', 'pros', 'cons',
            'graduation_year', 'is_verified', 'is_anonymous',
            'helpful_count', 'is_approved', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'helpful_count', 'is_approved', 'created_at']
    
    def get_user_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous Student"
        return f"{obj.user.first_name} {obj.user.last_name[0]}." if obj.user.last_name else obj.user.first_name


class CareerPathSerializer(serializers.ModelSerializer):
    """Serializer for career outcomes linked to courses."""
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    salary_range = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CareerPath
        fields = [
            'id', 'name', 'sector', 'sector_display', 'description',
            'salary_min', 'salary_max', 'salary_median', 'salary_range',
            'employment_rate', 'growth_outlook', 'key_skills',
            'course_count', 'is_active'
        ]
    
    def get_salary_range(self, obj):
        if obj.salary_min and obj.salary_max:
            return f"£{obj.salary_min:,} - £{obj.salary_max:,}"
        return None
    
    def get_course_count(self, obj):
        return obj.courses.count()


class CourseQuickApplySerializer(serializers.ModelSerializer):
    """Serializer for quick apply submissions."""
    course_name = serializers.CharField(source='course.name', read_only=True)
    university_name = serializers.CharField(source='course.university.name', read_only=True)
    student_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = CourseQuickApply
        fields = [
            'id', 'course', 'course_name', 'university_name',
            'student', 'student_name',
            'guest_name', 'guest_email', 'guest_phone', 'guest_country',
            'highest_qualification', 'percentage', 'ielts_score',
            'work_experience_years', 'preferred_intake', 'message',
            'status', 'status_display', 'converted_application',
            'source', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'converted_application', 'source', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        return obj.guest_name


class CourseReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""
    
    class Meta:
        model = CourseReview
        fields = [
            'course', 'overall_rating', 'teaching_quality', 'career_prospects',
            'value_for_money', 'course_content',
            'title', 'review_text', 'pros', 'cons',
            'graduation_year', 'is_anonymous'
        ]
    
    def validate_overall_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class CourseWithReviewsSerializer(CourseListSerializer):
    """Course list with embedded review stats."""
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    career_paths = CareerPathSerializer(many=True, read_only=True)
    
    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ['avg_rating', 'review_count', 'career_paths']
    
    def get_avg_rating(self, obj):
        from django.db.models import Avg
        result = obj.reviews.filter(is_approved=True).aggregate(Avg('overall_rating'))
        avg = result['overall_rating__avg']
        return round(avg, 1) if avg else None
    
    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()

