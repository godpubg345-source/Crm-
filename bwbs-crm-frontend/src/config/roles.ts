// ============================================================================
// ROLE ACCESS — single source of truth for which portal each role uses.
// Role values mirror backend `User.Role` (apps/identity/accounts/models.py).
// Frontend gating is UX only; the backend enforces data permissions.
// ============================================================================

import type { UserRole } from '../types/user';

/** Roles allowed into the Admin portal (/admin) */
export const ADMIN_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'COUNTRY_MANAGER', 'AUDITOR'];

/** Roles allowed into the CEO executive suite (/ceo) */
export const CEO_ROLES: readonly UserRole[] = ['CEO', 'SUPER_ADMIN', 'COUNTRY_MANAGER'];

/** Roles that work day-to-day in the Employee portal (/employee-portal) */
export const EMPLOYEE_ROLES: readonly UserRole[] = ['BRANCH_MANAGER', 'COUNSELOR', 'FINANCE_OFFICER', 'DOC_PROCESSOR'];

/** Staff roles that may open the Student portal in preview mode */
export const STUDENT_PREVIEW_ROLES: readonly UserRole[] = [
    'SUPER_ADMIN', 'CEO', 'COUNTRY_MANAGER', 'AUDITOR', 'BRANCH_MANAGER', 'COUNSELOR',
];

export const hasRole = (role: string | undefined | null, allowed: readonly UserRole[]): boolean =>
    !!role && (allowed as readonly string[]).includes(role);

/** Landing page for a staff role after login, or when it hits a portal it can't use.
 *  EMPLOYEE_ROLES and any unrecognised role fall through to the Employee portal. */
export const homePathForRole = (role: string | undefined | null): string => {
    if (role === 'CEO' || role === 'COUNTRY_MANAGER') return '/ceo';
    if (hasRole(role, ADMIN_ROLES)) return '/admin';
    return '/employee-portal';
};
