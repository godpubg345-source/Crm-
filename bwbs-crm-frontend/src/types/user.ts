// ============================================================================
// USER TYPES - Shared across all portals
// ============================================================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COUNTRY_MANAGER'
  | 'BRANCH_MANAGER'
  | 'COUNSELOR'
  | 'FINANCE_OFFICER'
  | 'DOC_PROCESSOR'
  | 'AUDITOR'
  | 'CEO';

export interface BranchDetails {
  id: string;
  name: string;
  code: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_superuser?: boolean;
  branch?: string;
  branch_details?: BranchDetails;
  phone?: string;
  is_active?: boolean;
}

export interface UserListItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  branch_details?: BranchDetails;
}

export interface UserCreatePayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
  branch?: string;
  phone?: string;
}

/** Roles that can switch between branches in the UI */
export const BRANCH_SWITCHING_ROLES: UserRole[] = ['SUPER_ADMIN', 'AUDITOR', 'COUNTRY_MANAGER', 'CEO'];
