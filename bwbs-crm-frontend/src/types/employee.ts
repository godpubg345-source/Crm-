// ============================================================================
// EMPLOYEE TYPES - Employee portal & HR management
// ============================================================================

export interface EmployeePerformance {
  id: string;
  user: string;
  points: number;
  xp: number;
  level: number;
  total_conversions: number;
  revenue_generated: string;
  wallet_balance: string;
  average_response_time?: string;
  last_active: string;
}

export interface EmployeeDossier {
  id: string;
  user: string;
  base_salary: string;
  currency: string;
  joined_date?: string;
  probation_end_date?: string;
  contract_type: string;
  contract_progress: number;
  specialties: string[];
  last_review_date?: string;
  next_review_date?: string;
}

export interface AttendanceLog {
  id: string;
  user: string;
  branch: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  total_hours: number;
  is_on_leave: boolean;
  notes?: string;
}

export type LeaveType = 'SICK' | 'ANNUAL' | 'UNPAID' | 'MATERNITY' | 'EMERGENCY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  user: string;
  branch: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  approval_notes?: string;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  user: string;
  month: string;
  base_salary_snapshot: string;
  incentive_total: string;
  gross_payout: string;
  tax_deductions: string;
  other_deductions: string;
  net_payout: string;
  status: string;
  payout_date?: string;
}
