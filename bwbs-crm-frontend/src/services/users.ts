import api from './api';

// ============================================================================
// USERS SERVICE - BWBS Education CRM
// ============================================================================

export interface EmployeePerformance {
    points: number;
    xp: number;
    level: number;
    total_conversions: number;
    revenue_generated: string;
    wallet_balance: string;
    last_active: string;
}

export interface EmployeeDossier {
    base_salary: string;
    currency: string;
    joined_date: string;
    probation_end_date: string;
    contract_type: string;
    contract_type_display?: string;
    contract_progress: number;
    last_review_date?: string;
    next_review_date?: string;
}

export interface EmployeeAudit {
    id: string;
    actor_name: string;
    event_type: string;
    field_name: string;
    old_value: string | null;
    new_value: string | null;
    timestamp: string;
    ip_address?: string;
}

export interface EmployeeIncentive {
    id: string;
    month: string;
    month_display: string;
    points_earned: number;
    conversions: number;
    revenue_generated: string;
    base_incentive: string;
    performance_multiplier: string;
    total_incentive: string;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
    status_display: string;
    remarks: string | null;
}

export interface EmployeePayroll {
    id: string;
    month: string;
    month_display: string;
    base_salary_snapshot: string;
    incentive_total: string;
    gross_payout: string;
    tax_deductions: string;
    other_deductions: string;
    net_payout: string;
    status: 'PENDING' | 'APPROVED' | 'PAID' | 'VOID';
    status_display: string;
    payout_date: string | null;
    payslip_pdf: string | null;
}

export interface PayrollReport {
    period: string;
    total_gross: string;
    total_net: string;
    avg_monthly: string;
    records: EmployeePayroll[];
}

export interface AttendanceLog {
    id: string;
    user: string;
    user_name?: string;
    branch: string;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    total_hours: number;
    is_on_leave: boolean;
    notes?: string;
}

export interface LeaveRequest {
    id: string;
    user: string;
    user_name?: string;
    branch: string;
    leave_type: 'SICK' | 'ANNUAL' | 'UNPAID' | 'MATERNITY' | 'EMERGENCY';
    leave_type_display?: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    status_display?: string;
    approved_by?: string;
    approved_by_name?: string;
    approval_notes?: string;
    created_at: string;
}

export interface UserListItem {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    role_display: string;
    branch: string;
    branch_details?: any;
    is_active: boolean;
    performance?: EmployeePerformance;
    dossier?: EmployeeDossier;
    audit_records?: EmployeeAudit[];
    performance_incentives?: EmployeeIncentive[];
    payroll_records?: EmployeePayroll[];
    attendance_logs?: AttendanceLog[];
    leave_requests?: LeaveRequest[];
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface EmployeeStats {
    user_id: string;
    full_name: string;
    conversion_rate: number;
    total_leads: number;
    enrolled_leads: number;
    points: number;
    xp: number;
    level: number;
    wallet_balance: string;
    revenue_generated: string;
}

export const getUsers = async (role?: string, branchId?: string): Promise<UserListItem[]> => {
    let query = '?is_active=True';
    if (role) query += `&role=${role}`;
    if (branchId) query += `&branch=${branchId}`;

    const response = await api.get<PaginatedResponse<UserListItem> | UserListItem[]>(`/users/${query}`);
    const data = response.data;
    if ('results' in data) {
        return data.results;
    }
    if (Array.isArray(data)) {
        return data;
    }
    return [];
};

export const getCounselors = async (): Promise<UserListItem[]> => {
    return getUsers('COUNSELOR');
};

export const getEmployeePerformance = async (): Promise<EmployeePerformance> => {
    const response = await api.get('/users/performance/');
    return response.data;
};

export const getEmployeeLeaderboard = async (branchId?: string): Promise<UserListItem[]> => {
    const query = branchId ? `?branch=${branchId}` : '';
    const response = await api.get(`/users/leaderboard/${query}`);
    return response.data;
};

export const getUserStats = async (userId: string): Promise<EmployeeStats> => {
    const response = await api.get(`/users/${userId}/stats/`);
    return response.data;
};

export const createUser = async (data: any): Promise<UserListItem> => {
    const response = await api.post('/users/', data);
    return response.data;
};

export const updateUser = async (userId: string, data: any): Promise<UserListItem> => {
    const response = await api.put(`/users/${userId}/`, data);
    return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}//`);
};

export const generatePayroll = async (userId: string, month: string): Promise<EmployeePayroll> => {
    const response = await api.post(`/users/${userId}/generate_payroll/`, { month });
    return response.data;
};

export const getPayrollReport = async (userId: string, months: number = 6): Promise<PayrollReport> => {
    const response = await api.get(`/users/${userId}/payroll_report/?months=${months}`);
    return response.data;
};

export const getAttendanceLogs = async (branchId?: string, userId?: string): Promise<AttendanceLog[]> => {
    let url = '/attendance/';
    const params = new URLSearchParams();
    if (branchId) params.append('branch', branchId);
    if (userId) params.append('user', userId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await api.get(url);
    return response.data?.results || response.data;
};

export const clockOutAllStaff = async (branchId: string): Promise<{ status: string; updated: number }> => {
    const response = await api.post('/attendance/clock-out-all/', { branch: branchId });
    return response.data;
};

export const exportPersonnelLog = async (branchId: string, start?: string, end?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('branch', branchId);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const response = await api.get(`/attendance/export/?${params.toString()}`, {
        responseType: 'blob'
    });
    return response.data;
};

export const getLeaveRequests = async (branchId?: string, userId?: string): Promise<LeaveRequest[]> => {
    let url = '/leave-requests/';
    const params = new URLSearchParams();
    if (branchId) params.append('branch', branchId);
    if (userId) params.append('user', userId);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await api.get(url);
    return response.data?.results || response.data;
};

export const approveLeave = async (id: string, notes?: string): Promise<void> => {
    await api.post(`/leave-requests/${id}/approve/`, { notes });
};

export const rejectLeave = async (id: string, notes?: string): Promise<void> => {
    await api.post(`/leave-requests/${id}/reject/`, { notes });
};

export default {
    getUsers,
    getCounselors,
    getEmployeePerformance,
    getEmployeeLeaderboard,
    getUserStats,
    createUser,
    updateUser,
    deleteUser,
    generatePayroll,
    getPayrollReport,
    getAttendanceLogs,
    clockOutAllStaff,
    exportPersonnelLog,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
};
