"""
Custom Mixins for Multi-Tenant Data Isolation.

These mixins enforce branch-level data isolation across the CRM,
ensuring that users can only access data belonging to their assigned branch.
"""

from rest_framework.exceptions import ValidationError

from core.utils.branch_context import (
    resolve_branch_from_request,
    is_hq_user,
    is_country_manager,
    get_user_country,
)


class BranchIsolationMixin:
    """
    Mixin that filters querysets based on user's branch assignment.
    
    Rules:
    1. SUPER_ADMIN or is_superuser: Full access to all data
    2. User with branch: Access only to their branch's data
    3. User without branch (and not admin): No access (empty queryset)
    
    Usage:
        class StudentViewSet(BranchIsolationMixin, ModelViewSet):
            queryset = Student.objects.all()
            ...
    
    Important: BranchIsolationMixin MUST come before ModelViewSet in inheritance.
    """
    
    # Field name used for branch filtering (override if different)
    branch_field = 'branch'
    
    def get_queryset(self):
        """
        Filter queryset based on the active 'Branch Context' set by Middleware.
        """
        # Get the base queryset from parent class
        queryset = super().get_queryset()
        user = self.request.user

        # 0. SUPERUSER BYPASS - Always allow full access
        if user.is_superuser:
            # Resolve branch for context but don't filter
            branch = resolve_branch_from_request(self.request)
            self.request.branch = branch
            return queryset

        # Resolve branch context after auth (JWT runs in DRF, not middleware)
        branch = resolve_branch_from_request(self.request)
        self.request.branch = branch
        
        # 1. Check if a Branch Context is active (set by Middleware)
        # This handles both Normal Staff (auto-set) and Admin Switching (header-set)
        if hasattr(self.request, 'branch') and self.request.branch is not None:
            # If the filter field IS the ID itself (e.g. for BranchViewSet), don't append _id
            if self.branch_field in ('id', 'pk'):
                filter_kwargs = {self.branch_field: self.request.branch.id}
            else:
                # Use branch_id to avoid UUID object conversion issues if `self.request.branch` appears as string vs object
                filter_kwargs = {f"{self.branch_field}_id": self.request.branch.id} 
            return queryset.filter(**filter_kwargs)
            
        # 2. If NO Branch Context (e.g. Super Admin Global View)
        # Verify user allowed to see everything
        if is_hq_user(user):
            return queryset

        # Country Manager: allow access to all branches in their country
        if is_country_manager(user):
            user_country = get_user_country(user)
            if not user_country:
                return queryset.none()
            # Branch model itself uses "country"
            if self.branch_field in ("id", "pk") and hasattr(queryset.model, "country"):
                return queryset.filter(country=user_country)
            return queryset.filter(**{f"{self.branch_field}__country": user_country})
        
        # 3. Fallback: No branch context and not authorized for global view
        return queryset.none()


class BranchIsolationCreateMixin:
    """
    Mixin that auto-assigns the user's branch on object creation.
    
    This ensures that when a user creates a Lead, Student, etc.,
    it is automatically assigned to their branch.
    """
    
    def perform_create(self, serializer):
        """
        Auto-assign branch on create if user has a branch.
        """
        user = self.request.user
        branch = resolve_branch_from_request(self.request)
        
        # If user has a branch and the model has a branch field
        if 'branch' in serializer.fields:
            requested_branch = serializer.validated_data.get('branch')

            if not is_hq_user(user):
                if is_country_manager(user):
                    user_country = get_user_country(user)
                    target_branch = requested_branch or branch or getattr(user, "branch", None)
                    if target_branch is None:
                        raise ValidationError({'branch': 'Branch is required.'})
                    if not user_country or target_branch.country != user_country:
                        raise ValidationError({'branch': 'You cannot set a different country branch.'})
                    serializer.save(branch=target_branch)
                    return

                if branch is None:
                    raise ValidationError({'branch': 'Branch is required.'})
                if requested_branch and requested_branch != branch:
                    raise ValidationError({'branch': 'You cannot set a different branch.'})
                serializer.save(branch=branch)
                return

            if branch is not None and 'branch' not in serializer.validated_data:
                serializer.save(branch=branch)
                return
        
        # Otherwise, save normally (admin users may specify branch)
        serializer.save()
