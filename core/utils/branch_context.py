from typing import Optional

from rest_framework.exceptions import PermissionDenied

from accounts.models import User as UserModel
from branches.models import Branch


def is_hq_user(user) -> bool:
    """
    HQ-level access (global visibility).
    """
    if not user:
        return False
    return bool(getattr(user, "is_superuser", False) or getattr(user, "role", None) in [
        UserModel.Role.SUPER_ADMIN,
        UserModel.Role.AUDITOR,
    ])


def is_country_manager(user) -> bool:
    if not user:
        return False
    return getattr(user, "role", None) == UserModel.Role.COUNTRY_MANAGER


def get_user_country(user) -> Optional[str]:
    if not user:
        return None
    branch = getattr(user, "branch", None)
    return getattr(branch, "country", None) if branch else None


def resolve_branch_from_request(request) -> Optional[Branch]:
    """
    Resolve active branch context.

    Rules:
    - Unauthenticated: None
    - HQ user: X-Branch-ID header (if valid) else user's assigned branch (if any), else None (global)
    - Non-HQ user: user's assigned branch
    """
    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        return None

    if is_hq_user(user):
        header_branch_id = None
        if hasattr(request, "headers"):
            header_branch_id = request.headers.get("X-Branch-ID")
        if not header_branch_id and hasattr(request, "META"):
            header_branch_id = request.META.get("HTTP_X_BRANCH_ID")

        if header_branch_id:
            try:
                return Branch.objects.get(id=header_branch_id)
            except (Branch.DoesNotExist, ValueError):
                return None
        # Auditors default to global view unless header is supplied
        if getattr(user, "role", None) == UserModel.Role.AUDITOR:
            return None
        return user.branch

    if is_country_manager(user):
        header_branch_id = None
        if hasattr(request, "headers"):
            header_branch_id = request.headers.get("X-Branch-ID")
        if not header_branch_id and hasattr(request, "META"):
            header_branch_id = request.META.get("HTTP_X_BRANCH_ID")

        if header_branch_id:
            try:
                branch = Branch.objects.get(id=header_branch_id)
                user_country = get_user_country(user)
                if user_country and branch.country == user_country:
                    return branch
            except (Branch.DoesNotExist, ValueError):
                return None

        # Country managers default to country-wide view
        return None

    return user.branch


def assert_branch_access(request, branch, message: str = "You do not have access to this branch.") -> None:
    """
    Raise if a non-HQ user attempts to access a different branch.
    """
    user = getattr(request, "user", None)
    if is_hq_user(user):
        return

    if is_country_manager(user):
        user_country = get_user_country(user)
        if branch is None or not user_country or branch.country != user_country:
            raise PermissionDenied(message)
        return

    active_branch = resolve_branch_from_request(request)
    if active_branch is None:
        return
    if branch is None or branch != active_branch:
        raise PermissionDenied(message)
