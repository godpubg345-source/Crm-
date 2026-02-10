import api from './api';

export interface Branch {
    id: string;
    code: string;
    name: string;
    country: string;
    currency: string;
    address?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    timezone: string;
    is_hq: boolean;
    is_active: boolean;
    opening_time: string;
    closing_time: string;
    auto_handoff_enabled: boolean;
    is_currently_open: boolean;
    local_time: string;
    created_at?: string;
}

export interface BranchStats {
    total_students: number;
    active_applications: number;
    revenue_ytd: number;
    conversion_rate: number;
}

export interface BranchAnalytics {
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    active_students: number;
    revenue_estimate: number;
    lead_trends?: { month: string; count: number }[];
    revenue_breakdown?: { type: string; total: number }[];
}

export interface BranchStatus {
    id: string;
    code: string;
    name: string;
    timezone: string;
    local_time: string;
    is_open: boolean;
    opening_time: string;
    closing_time: string;
}

export interface HandoffSuggestion {
    lead_id: string;
    current_branch: string;
    suggested_branch: string;
    suggested_branch_id: string;
    reason: string;
}

export interface PredictiveStaffing {
    daily_velocity: number;
    leads_per_staff_monthly: number;
    staff_count: number;
    status: 'STABLE' | 'WARNING' | 'CRITICAL';
    recommendation: string;
    projected_load_14d: number;
}

export interface TransferRequest {
    id: string;
    lead?: string;
    student?: string;
    from_branch: string;
    to_branch: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    requested_by: string;
    requested_by_name: string;
    target_name: string;
    from_branch_name: string;
    to_branch_name: string;
    created_at: string;
}

export interface BranchTarget {
    id: string;
    branch: string;
    month: number;
    year: number;
    target_leads: number;
    target_enrollments: number;
    target_revenue: number;
    currency: string;
}

export interface FixedAsset {
    id: string;
    branch: string;
    name: string;
    asset_tag?: string;
    category: 'IT_EQUIPMENT' | 'FURNITURE' | 'OFFICE_SUPPLY' | 'VEHICLE' | 'OTHER';
    category_display?: string;
    purchase_date?: string;
    purchase_value: number;
    current_value: number;
    status: 'ACTIVE' | 'UNDER_REPAIR' | 'DEPRECATED' | 'LOST';
    status_display?: string;
    notes?: string;
}

export interface BranchComplaint {
    id: string;
    branch: string;
    subject: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    status_display?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    priority_display?: string;
    created_by: string;
    created_by_name?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    resolution_notes?: string;
    resolved_at?: string;
    created_at: string;
}

export const getBranches = async (): Promise<Branch[]> => {
    const response = await api.get('/branches/');
    if (response.data?.results) {
        return response.data.results;
    }
    return response.data;
};

export const getBranchStats = async (id: string): Promise<BranchStats> => {
    const response = await api.get(`/dashboard/stats/?branch=${id}`);
    return response.data;
};

export const createBranch = async (data: Partial<Branch>): Promise<Branch> => {
    const response = await api.post('/branches/', data);
    return response.data;
};

export const updateBranch = async (id: string, data: Partial<Branch>): Promise<Branch> => {
    const response = await api.patch(`/branches/${id}/`, data);
    return response.data;
};

export const deleteBranch = async (id: string): Promise<void> => {
    await api.delete(`/branches/${id}/`);
};

export const getBranchStaff = async (id: string): Promise<any[]> => {
    const response = await api.get(`/branches/${id}/staff/`);
    return response.data;
};

export const assignBranchStaff = async (id: string, userIds: string[]): Promise<{ message: string }> => {
    const response = await api.post(`/branches/${id}/assign-staff/`, { user_ids: userIds });
    return response.data;
};

export const getBranchAnalytics = async (id: string): Promise<BranchAnalytics> => {
    const response = await api.get(`/branches/${id}/analytics/`);
    return response.data;
};

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
    const response = await api.get('/branch-transfers/');
    return response.data?.results || response.data;
};

export const createTransferRequest = async (data: Partial<TransferRequest>): Promise<TransferRequest> => {
    const response = await api.post('/branch-transfers/', data);
    return response.data;
};

export const approveTransferRequest = async (id: string, notes: string): Promise<any> => {
    const response = await api.post(`/branch-transfers/${id}/approve/`, { notes });
    return response.data;
};

export const rejectTransferRequest = async (id: string, notes: string): Promise<any> => {
    const response = await api.post(`/branch-transfers/${id}/reject/`, { notes });
    return response.data;
};

export const getBranchTargets = async (branchId?: string): Promise<BranchTarget[]> => {
    const url = branchId ? `/branch-targets/?branch=${branchId}` : '/branch-targets/';
    const response = await api.get(url);
    return response.data?.results || response.data;
};

export const createBranchTarget = async (data: Partial<BranchTarget>): Promise<BranchTarget> => {
    const response = await api.post('/branch-targets/', data);
    return response.data;
};

export const getBranchLeaderboard = async (): Promise<any[]> => {
    const response = await api.get('/branches/leaderboard/');
    return response.data;
};

export const getBranchOperationalStatus = async (): Promise<BranchStatus[]> => {
    const response = await api.get('/branches/status/');
    return response.data;
};

export const getHandoffSuggestions = async (id: string): Promise<HandoffSuggestion[]> => {
    const response = await api.get(`/branches/${id}/handoff-suggestions/`);
    return response.data;
};

export const executeHandoff = async (branchId: string, leadId: string): Promise<any> => {
    const response = await api.post(`/branches/${branchId}/execute-handoff/`, { lead_id: leadId });
    return response.data;
};

export const getPredictiveStaffing = async (id: string): Promise<PredictiveStaffing> => {
    const response = await api.get(`/branches/${id}/predictive-staffing/`);
    return response.data;
};

export const getFixedAssets = async (branchId?: string): Promise<FixedAsset[]> => {
    const url = branchId ? `/fixed-assets/?branch=${branchId}` : '/fixed-assets/';
    const response = await api.get(url);
    return response.data?.results || response.data;
};

export const getBranchComplaints = async (branchId?: string): Promise<BranchComplaint[]> => {
    const url = branchId ? `/branch-complaints/?branch=${branchId}` : '/branch-complaints/';
    const response = await api.get(url);
    return response.data?.results || response.data;
};

export const createFixedAsset = async (data: Partial<FixedAsset>): Promise<FixedAsset> => {
    const response = await api.post('/fixed-assets/', data);
    return response.data;
};

export const createBranchComplaint = async (data: Partial<BranchComplaint>): Promise<BranchComplaint> => {
    const response = await api.post('/branch-complaints/', data);
    return response.data;
};

// Branch Finance Summary
export interface BranchFinanceSummary {
    total_payroll_monthly: number;
    currency: string;
    commissions: {
        pending: { total: number; count: number };
        invoiced: { total: number; count: number };
        received: { total: number; count: number };
    };
    recent_claims: {
        id: string;
        university: string;
        expected_amount: number;
        status: string;
        status_display: string;
        created_at: string;
    }[];
    total_revenue_estimate: number;
}

export const getBranchFinanceSummary = async (id: string): Promise<BranchFinanceSummary> => {
    const response = await api.get(`/branches/${id}/finance-summary/`);
    return response.data;
};

export const exportBranchAnalytics = async (id: string): Promise<Blob> => {
    const response = await api.get(`/branches/${id}/export-analytics/`, {
        responseType: 'blob'
    });
    return response.data;
};
