from django.contrib import admin
from .models import MagicLink

@admin.register(MagicLink)
class MagicLinkAdmin(admin.ModelAdmin):
    list_display = ('student', 'created_by', 'expires_at', 'is_valid_display')
    readonly_fields = ('token',)
    
    def is_valid_display(self, obj):
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = "Is Valid?"
