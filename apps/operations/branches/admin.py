from django.contrib import admin
from .models import Branch

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'country', 'city_display', 'is_hq', 'is_active')
    search_fields = ('name', 'code', 'country')
    list_filter = ('country', 'is_hq', 'is_active')
    
    def city_display(self, obj):
        # Infer city from name or address if specific city field missing
        # Just return address snippet or name
        return obj.name
    city_display.short_description = "City/Location"
