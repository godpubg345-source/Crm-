from django.contrib import admin
from .models import FeeType, Transaction, CommissionClaim

@admin.register(FeeType)
class FeeTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'branch', 'is_active')
    list_filter = ('branch', 'is_active')
    search_fields = ('name',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('student', 'amount', 'transaction_type', 'status', 'date')
    list_filter = ('status', 'transaction_type', 'date')
    search_fields = ('student__student_code', 'reference_number')
    autocomplete_fields = ['student', 'fee_type']

@admin.register(CommissionClaim)
class CommissionClaimAdmin(admin.ModelAdmin):
    list_display = ('application', 'university', 'expected_amount', 'status', 'invoice_number')
    list_filter = ('status', 'currency', 'university__country')
    search_fields = ('application__student__student_code', 'invoice_number')
