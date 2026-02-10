import api from './api';

// ============================================================================
// GOVERNANCE SERVICE - BWBS Education CRM
// ============================================================================

export type EntityType = 'LEAD' | 'STUDENT' | 'DOCUMENT';
export type RetentionAction = 'ANONYMIZE' | 'DELETE';
export type DeletionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type ReviewCycleStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ReviewItemStatus = 'PENDING' | 'APPROVED' | 'REVOKE' | 'REMEDIATED';

export interface RetentionPolicy {
    id: string;
    entity_type: EntityType;
    entity_type_display?: string;
    retention_days: number;
    action: RetentionAction;
    action_display?: string;
    is_active: boolean;
    notes: string | null;
    created_at: string;
}

export interface DataDeletionRequest {
    id: string;
    request_type: 'ANONYMIZE' | 'DELETE';
    request_type_display?: string;
    status: DeletionStatus;
    status_display?: string;
    lead: string | null;
    student: string | null;
    document: string | null;
    requested_by: string | null;
    requested_by_details?: { id: string; first_name: string; last_name: string; email: string };
    approved_by: string | null;
    completed_at: string | null;
    reason: string | null;
    notes: string | null;
    created_at: string;
}

export interface AccessReviewCycle {
    id: string;
    name: string;
    period_start: string;
    period_end: string;
    status: ReviewCycleStatus;
    status_display?: string;
    created_by: string | null;
    created_at: string;
}

export interface AccessReviewItem {
    id: string;
    cycle: string;
    user: string;
    user_details?: { id: string; first_name: string; last_name: string; email: string; role: string };
    status: ReviewItemStatus;
    status_display?: string;
    findings: Record<string, unknown>;
    reviewed_by: string | null;
    reviewed_at: string | null;
    notes: string | null;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Retention Policies
export const getRetentionPolicies = async (params: { page?: number } = {}): Promise<PaginatedResponse<RetentionPolicy>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<RetentionPolicy>>(`/governance/retention-policies/?${qs.toString()}`);
    return response.data;
};

export const createRetentionPolicy = async (data: Partial<RetentionPolicy>): Promise<RetentionPolicy> => {
    const response = await api.post<RetentionPolicy>('/governance/retention-policies/', data);
    return response.data;
};

export const updateRetentionPolicy = async (id: string, data: Partial<RetentionPolicy>): Promise<RetentionPolicy> => {
    const response = await api.patch<RetentionPolicy>(`/governance/retention-policies/${id}/`, data);
    return response.data;
};

// Data Deletion Requests
export const getDataDeletionRequests = async (params: { status?: DeletionStatus; page?: number } = {}): Promise<PaginatedResponse<DataDeletionRequest>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<DataDeletionRequest>>(`/governance/data-deletions/?${qs.toString()}`);
    return response.data;
};

export const createDataDeletionRequest = async (data: Partial<DataDeletionRequest>): Promise<DataDeletionRequest> => {
    const response = await api.post<DataDeletionRequest>('/governance/data-deletions/', data);
    return response.data;
};

export const updateDataDeletionRequest = async (id: string, data: Partial<DataDeletionRequest>): Promise<DataDeletionRequest> => {
    const response = await api.patch<DataDeletionRequest>(`/governance/data-deletions/${id}/`, data);
    return response.data;
};

// Access Review Cycles
export const getAccessReviewCycles = async (params: { status?: ReviewCycleStatus; page?: number } = {}): Promise<PaginatedResponse<AccessReviewCycle>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AccessReviewCycle>>(`/governance/access-reviews/?${qs.toString()}`);
    return response.data;
};

export const createAccessReviewCycle = async (data: Partial<AccessReviewCycle>): Promise<AccessReviewCycle> => {
    const response = await api.post<AccessReviewCycle>('/governance/access-reviews/', data);
    return response.data;
};

// Access Review Items
export const getAccessReviewItems = async (params: { cycle?: string; status?: ReviewItemStatus; page?: number } = {}): Promise<PaginatedResponse<AccessReviewItem>> => {
    const qs = new URLSearchParams();
    if (params.cycle) qs.append('cycle', params.cycle);
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AccessReviewItem>>(`/governance/access-review-items/?${qs.toString()}`);
    return response.data;
};

export const updateAccessReviewItem = async (id: string, data: Partial<AccessReviewItem>): Promise<AccessReviewItem> => {
    const response = await api.patch<AccessReviewItem>(`/governance/access-review-items/${id}/`, data);
    return response.data;
};

export default {
    getRetentionPolicies,
    createRetentionPolicy,
    updateRetentionPolicy,
    getDataDeletionRequests,
    createDataDeletionRequest,
    updateDataDeletionRequest,
    getAccessReviewCycles,
    createAccessReviewCycle,
    getAccessReviewItems,
    updateAccessReviewItem,
};
