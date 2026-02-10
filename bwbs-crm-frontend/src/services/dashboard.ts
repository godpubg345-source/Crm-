import api from './api';

// ============================================================================
// DASHBOARD SERVICE - BWBS Education CRM
// ============================================================================

// User permission flags from backend RBAC
export interface UserPermissions {
    can_view_all_branches: boolean;
    can_manage_users: boolean;
    can_manage_finance: boolean;
    can_manage_leads: boolean;
    can_manage_students: boolean;
    can_manage_documents: boolean;
    can_view_reports: boolean;
    can_manage_universities: boolean;
    is_read_only: boolean;
    is_admin: boolean;
}

// Branch info
export interface BranchInfo {
    id: string;
    code: string;
    name: string;
    country: string;
    is_hq: boolean;
}

// Current user context
export interface UserContext {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    role_display: string;
    is_superuser: boolean;
    branch: BranchInfo | null;
    permissions: UserPermissions;
}

// Stats object
export interface DashboardStats {
    total_students: number;
    total_leads: number;
    active_applications: number;
    pending_visas: number;
    visa_success_rate: number;
    new_leads_today: number;
    pending_tasks: number;
    total_revenue: number;
}

// Quick stat card
export interface QuickStat {
    label: string;
    value: number;
    icon: string;
    color: string;
}


// Full dashboard response
export interface RecentTask {
    id: string;
    title: string;
    due_date: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    student_name: string | null;
}

export interface RecentActivity {
    id: string;
    action: string;
    model: string;
    description: string;
    actor: string;
    timestamp: string;
}

export interface PipelineStat {
    stage: string;
    count: number;
}

export interface VisaAlert {
    id: string;
    student_name: string;
    country: string;
    days_pending: number;
}

export interface DashboardResponse {
    user: UserContext;
    stats: DashboardStats;
    quick_stats: QuickStat[];
    recent_tasks: RecentTask[];
    recent_activities: RecentActivity[];
    pipeline_stats: PipelineStat[];
    visa_alerts: VisaAlert[];
    analytics?: {
        revenue_trend: { month: string; amount: number }[];
        lead_sources: { source: string; count: number }[];
    };
}

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================
export const getDashboardStats = async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard/stats/');
    return response.data;
};

// ============================================================================
// HELPER: Get user permissions for conditional rendering
// ============================================================================
export const getUserPermissions = async (): Promise<UserPermissions> => {
    const response = await getDashboardStats();
    return response.user.permissions;
};

export default {
    getDashboardStats,
    getUserPermissions,
};
