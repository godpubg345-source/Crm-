from django.contrib import admin
from .models import University, Course, AdmissionCriteria
import csv
from django.http import HttpResponse


class AdmissionCriteriaInline(admin.StackedInline):
    model = AdmissionCriteria
    can_delete = False
    verbose_name_plural = 'Admission Criteria'


class CourseInline(admin.TabularInline):
    model = Course
    extra = 1
    fields = ['name', 'level', 'duration', 'tuition_fee', 'currency', 'is_active']


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'is_partner', 'course_count', 'is_active')
    list_filter = ('country', 'is_partner', 'is_active')
    search_fields = ('name', 'city')
    inlines = [AdmissionCriteriaInline, CourseInline]
    actions = ['export_to_csv']
    
    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = 'Courses'
    
    @admin.action(description="Export selected universities to CSV")
    def export_to_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="universities.csv"'
        writer = csv.writer(response)
        writer.writerow(['Name', 'Country', 'City', 'Website', 'Is Partner', 'Commission Rate'])
        for uni in queryset:
            writer.writerow([
                uni.name, uni.country, uni.city, 
                uni.website, uni.is_partner, uni.commission_rate
            ])
        return response


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'university', 'level', 'duration', 'tuition_fee', 'currency', 'is_active')
    list_filter = ('level', 'currency', 'is_active', 'university__country')
    search_fields = ('name', 'university__name')
    autocomplete_fields = ['university']
