from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.models import User


class RolePermission(BasePermission):
    """
    Base role permission:
    - SAFE_METHODS allowed for roles in read_roles or write_roles
    - Unsafe methods allowed only for roles in write_roles
    - Superusers always allowed
    """

    read_roles = ()
    write_roles = ()

    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False):
            return True

        role = getattr(user, "role", None)
        if request.method in SAFE_METHODS:
            return role in self.read_roles or role in self.write_roles
        return role in self.write_roles


class UserManagementPermission(RolePermission):
    """
    Manage users: Super Admin, Country Manager, Branch Manager.
    Auditors get read-only access.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)


class BranchPermission(BasePermission):
    """
    Branches: read for Super Admin, Country/Branch Managers, Auditors.
    Write for Super Admin only.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if request.method in SAFE_METHODS:
            return bool(
                getattr(user, "is_superuser", False)
                or getattr(user, "role", None)
                in (
                    User.Role.SUPER_ADMIN,
                    User.Role.COUNTRY_MANAGER,
                    User.Role.BRANCH_MANAGER,
                    User.Role.AUDITOR,
                )
            )
        return bool(getattr(user, "is_superuser", False) or getattr(user, "role", None) == User.Role.SUPER_ADMIN)


class FinancePermission(RolePermission):
    """
    Finance endpoints: write for Super Admin + Finance Officer,
    read for Auditors + Branch/Country Managers.
    """
    read_roles = (User.Role.AUDITOR, User.Role.BRANCH_MANAGER, User.Role.COUNTRY_MANAGER)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.FINANCE_OFFICER)


class MagicLinkPermission(RolePermission):
    """
    Magic link management: staff roles.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
        User.Role.DOC_PROCESSOR,
    )


class UniversityPermission(BasePermission):
    """
    University/Course master data: read for any authenticated, write for Super Admin.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(getattr(user, "is_superuser", False) or getattr(user, "role", None) == User.Role.SUPER_ADMIN)


class LeadPermission(RolePermission):
    """
    Leads: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class StudentPermission(RolePermission):
    """
    Students: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors, Finance Officers, Doc Processors.
    """
    read_roles = (User.Role.AUDITOR, User.Role.FINANCE_OFFICER, User.Role.DOC_PROCESSOR)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class ApplicationPermission(RolePermission):
    """
    Applications: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors, Finance Officers, Doc Processors.
    """
    read_roles = (User.Role.AUDITOR, User.Role.FINANCE_OFFICER, User.Role.DOC_PROCESSOR)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class VisaPermission(RolePermission):
    """
    Visas: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors, Finance Officers.
    """
    read_roles = (User.Role.AUDITOR, User.Role.FINANCE_OFFICER)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class DocumentPermission(RolePermission):
    """
    Documents: write for Super Admin, Country/Branch Managers, Counselors, Doc Processors.
    Read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
        User.Role.DOC_PROCESSOR,
    )


class TaskPermission(RolePermission):
    """
    Tasks: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class CommunicationPermission(RolePermission):
    """
    Communications: write for Super Admin, Country/Branch Managers, Counselors.
    Read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (
        User.Role.SUPER_ADMIN,
        User.Role.COUNTRY_MANAGER,
        User.Role.BRANCH_MANAGER,
        User.Role.COUNSELOR,
    )


class AuditLogPermission(BasePermission):
    """
    Audit logs: read-only for Super Admin and Auditors.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "is_superuser", False):
            return True
        if request.method in SAFE_METHODS:
            return getattr(user, "role", None) in (User.Role.SUPER_ADMIN, User.Role.AUDITOR)
        return False


class CompliancePermission(RolePermission):
    """
    Compliance rules: write for Super Admin/Country/Branch Managers.
    Read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)


class AnalyticsPermission(RolePermission):
    """
    Analytics: read for Auditors, Finance Officers, Managers. Write for Super Admin/Managers.
    """
    read_roles = (User.Role.AUDITOR, User.Role.FINANCE_OFFICER, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)


class GovernancePermission(RolePermission):
    """
    Governance and access reviews: write for Super Admin/Country Managers, read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER)


class OperationsPermission(RolePermission):
    """
    Operations: write for Super Admin/Country/Branch Managers, read for Auditors/Finance.
    """
    read_roles = (User.Role.AUDITOR, User.Role.FINANCE_OFFICER)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)


class AutomationPermission(RolePermission):
    """
    Automation rules: write for Super Admin/Country/Branch Managers, read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER)


class PortalPermission(RolePermission):
    """
    Portal management: write for Super Admin/Managers/Counselors, read for Auditors.
    """
    read_roles = (User.Role.AUDITOR,)
    write_roles = (User.Role.SUPER_ADMIN, User.Role.COUNTRY_MANAGER, User.Role.BRANCH_MANAGER, User.Role.COUNSELOR)
