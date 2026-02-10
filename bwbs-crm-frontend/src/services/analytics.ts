import api from './api';

// ============================================================================
// ANALYTICS SERVICE - BWBS Education CRM
// ============================================================================

export interface BranchPerformance {
    branch_id: string;
    branch_name: string;
    total_leads: number;
    total_students: number;
    total_applications: number;
    conversion_rate: number;
    revenue: number;
}

export interface CounselorKpi {
    counselor_id: string;
    counselor_name: string;
    leads_assigned: number;
    leads_converted: number;
    applications_submitted: number;
    conversion_rate: number;
    avg_response_time: number;
}

export interface ForecastData {
    month: string;
    projected_leads: number;
    projected_conversions: number;
    projected_revenue: number;
}

export interface BranchKpiInput {
    id: string;
    branch: string;
    branch_details?: { id: string; name: string; code: string };
    period_start: string;
    period_end: string;
    marketing_spend: string;
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

export interface MetricSnapshot {
    id: string;
    metric_type: 'BRANCH_PERFORMANCE' | 'COUNSELOR_KPI' | 'FORECAST';
    metric_type_display?: string;
    period_start: string | null;
    period_end: string | null;
    data: Record<string, unknown>;
    generated_at: string;
    branch: string | null;
    created_by: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface AnalyticsQuery {
    branch?: string;
    period?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
}

// Branch Performance
export const getBranchPerformance = async (params: AnalyticsQuery = {}): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.branch) qs.append('branch', params.branch);
    if (params.period) qs.append('period', params.period);
    if (params.start_date) qs.append('start_date', params.start_date);
    if (params.end_date) qs.append('end_date', params.end_date);
    const response = await api.get(`/analytics/reports/branch_performance/?${qs.toString()}`);
    return response.data;
};

// Counselor KPIs
export const getCounselorKpis = async (params: AnalyticsQuery = {}): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.branch) qs.append('branch', params.branch);
    if (params.period) qs.append('period', params.period);
    const response = await api.get(`/analytics/reports/counselor_kpis/?${qs.toString()}`);
    return response.data;
};

// Forecast
export const getForecast = async (params: AnalyticsQuery = {}): Promise<any> => {
    const qs = new URLSearchParams();
    if (params.branch) qs.append('branch', params.branch);
    if (params.period) qs.append('period', params.period);
    const response = await api.get(`/analytics/reports/forecast/?${qs.toString()}`);
    return response.data;
};

// Branch KPI Inputs
export const getBranchKpiInputs = async (params: AnalyticsQuery = {}): Promise<PaginatedResponse<BranchKpiInput>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<BranchKpiInput>>(`/analytics/inputs/?${qs.toString()}`);
    return response.data;
};

export const createBranchKpiInput = async (data: Partial<BranchKpiInput>): Promise<BranchKpiInput> => {
    const response = await api.post<BranchKpiInput>('/analytics/inputs/', data);
    return response.data;
};

// Metric Snapshots
export const getMetricSnapshots = async (params: AnalyticsQuery = {}): Promise<PaginatedResponse<MetricSnapshot>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<MetricSnapshot>>(`/analytics/snapshots/?${qs.toString()}`);
    return response.data;
};

export default {
    getBranchPerformance,
    getCounselorKpis,
    getForecast,
    getBranchKpiInputs,
    createBranchKpiInput,
    getMetricSnapshots,
};
