import django_filters
from django.db.models import Q
from .models import Course


class CourseFilter(django_filters.FilterSet):
    """
    Advanced course filtering for search and eligibility matching.
    """
    # Price filters
    min_fee = django_filters.NumberFilter(field_name="tuition_fee", lookup_expr='gte')
    max_fee = django_filters.NumberFilter(field_name="tuition_fee", lookup_expr='lte')
    
    # University filters
    country = django_filters.CharFilter(field_name='university__country', lookup_expr='iexact')
    city = django_filters.CharFilter(field_name='university__city', lookup_expr='icontains')
    university = django_filters.NumberFilter(field_name='university__id')
    university_name = django_filters.CharFilter(field_name='university__name', lookup_expr='icontains')
    is_partner = django_filters.BooleanFilter(field_name='university__is_partner')
    
    # Course filters
    level = django_filters.CharFilter(lookup_expr='iexact')
    department = django_filters.CharFilter(lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')
    
    # IELTS filters
    max_ielts = django_filters.NumberFilter(field_name='ielts_overall', lookup_expr='lte')
    min_ielts = django_filters.NumberFilter(field_name='ielts_overall', lookup_expr='gte')
    
    # Intake filters
    intake_jan = django_filters.BooleanFilter(field_name='intake_january')
    intake_may = django_filters.BooleanFilter(field_name='intake_may')
    intake_sep = django_filters.BooleanFilter(field_name='intake_september')
    
    # Work experience
    no_work_exp = django_filters.BooleanFilter(field_name='work_experience_required', exclude=True)
    
    # Verification
    verified_only = django_filters.BooleanFilter(field_name='is_data_verified')
    
    class Meta:
        model = Course
        fields = [
            'university', 'level', 'currency', 'is_active',
            'intake_january', 'intake_may', 'intake_september'
        ]
    
    def filter_search(self, queryset, name, value):
        """Full-text search across course and university."""
        if not value:
            return queryset
        return queryset.filter(
            Q(name__icontains=value) |
            Q(university__name__icontains=value) |
            Q(department__icontains=value)
        )


class EligibilityFilter(django_filters.FilterSet):
    """
    Filter courses by student eligibility criteria.
    """
    # Student's profile
    country = django_filters.CharFilter(method='filter_by_student_country')
    ielts_score = django_filters.NumberFilter(method='filter_by_ielts')
    percentage = django_filters.NumberFilter(method='filter_by_percentage')
    has_work_exp = django_filters.BooleanFilter(method='filter_work_exp')
    
    class Meta:
        model = Course
        fields = []
    
    def filter_by_student_country(self, queryset, name, value):
        """Filter to courses that accept students from given country."""
        return queryset.filter(
            Q(country_requirements__country=value.upper()) |
            Q(country_requirements__isnull=True)
        ).distinct()
    
    def filter_by_ielts(self, queryset, name, value):
        """Filter courses where student meets IELTS requirement."""
        return queryset.filter(
            Q(ielts_overall__lte=value) | Q(ielts_overall__isnull=True)
        )
    
    def filter_by_percentage(self, queryset, name, value):
        """Filter courses where student meets percentage requirement."""
        # This checks against CourseRequirement
        return queryset.filter(
            Q(country_requirements__min_percentage__lte=value) |
            Q(country_requirements__isnull=True)
        ).distinct()
    
    def filter_work_exp(self, queryset, name, value):
        """Filter courses based on work experience requirement."""
        if value:  # Student has work experience
            return queryset
        else:  # Student doesn't have work experience
            return queryset.filter(work_experience_required=False)
