from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeTypeViewSet, TransactionViewSet, CommissionViewSet

router = DefaultRouter()
router.register(r'finance/fees', FeeTypeViewSet, basename='fee-type')
router.register(r'finance/transactions', TransactionViewSet, basename='transaction')
router.register(r'finance/commissions', CommissionViewSet, basename='commission')

urlpatterns = [
    path('', include(router.urls)),
]
