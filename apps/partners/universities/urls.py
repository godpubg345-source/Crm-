from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UniversityViewSet, CourseViewSet, CourseWishlistViewSet, LivingCostViewSet,
    CourseReviewViewSet, CareerPathViewSet, CourseQuickApplyViewSet
)

router = DefaultRouter()
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'wishlists', CourseWishlistViewSet, basename='wishlist')
router.register(r'living-costs', LivingCostViewSet, basename='living-cost')
router.register(r'course-reviews', CourseReviewViewSet, basename='course-review')
router.register(r'career-paths', CareerPathViewSet, basename='career-path')
router.register(r'quick-applies', CourseQuickApplyViewSet, basename='quick-apply')

urlpatterns = [
    path('', include(router.urls)),
]
