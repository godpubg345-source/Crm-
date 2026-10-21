// ============================================================================
// BRANCH TYPES - Shared across all portals
// ============================================================================

export interface Branch {
  id: string;
  name: string;
  code: string;
  country?: string;
  city?: string;
  is_active?: boolean;
}

export interface BranchTarget {
  id: string;
  branch: string;
  target_type: string;
  target_value: number;
  current_value: number;
  period_start: string;
  period_end: string;
}

export interface TransferRequest {
  id: string;
  user: string;
  from_branch: string;
  to_branch: string;
  status: string;
  reason: string;
  created_at: string;
}
