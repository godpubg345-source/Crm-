from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BranchViewSet, TransferRequestViewSet, BranchTargetViewSet,
    FixedAssetViewSet, BranchComplaintViewSet
)

router = DefaultRouter()
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'branch-transfers', TransferRequestViewSet, basename='branch-transfer')
router.register(r'branch-targets', BranchTargetViewSet, basename='branch-target')
router.register(r'fixed-assets', FixedAssetViewSet, basename='fixed-asset')
router.register(r'branch-complaints', BranchComplaintViewSet, basename='branch-complaint')

urlpatterns = [
    path('', include(router.urls)),
]
