import api from './api';

// ============================================================================
// AUDIT LOGS SERVICE - BWBS Education CRM
// ============================================================================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
    id: string;
    action: AuditAction;
    model: string;
    object_id?: string | null;
    object_repr?: string | null;
    branch?: string | null;
    branch_details?: {
        id: string;
        name: string;
        code: string;
        country?: string;
    } | null;
    actor?: string | null;
    actor_details?: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
    } | null;
    ip_address?: string | null;
    path: string;
    method: string;
    status_code?: number | null;
    changes: Record<string, unknown>;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface AuditLogQuery {
    action?: AuditAction | '';
    model?: string;
    actor?: string;
    branch?: string;
    search?: string;
    ordering?: string;
    page?: number;
}

export const getAuditLogs = async (params: AuditLogQuery = {}): Promise<PaginatedResponse<AuditLog>> => {
    const qs = new URLSearchParams();
    if (params.action) qs.append('action', params.action);
    if (params.model) qs.append('model', params.model);
    if (params.actor) qs.append('actor', params.actor);
    if (params.branch) qs.append('branch', params.branch);
    if (params.search) qs.append('search', params.search);
    if (params.ordering) qs.append('ordering', params.ordering);
    if (params.page) qs.append('page', String(params.page));

    const response = await api.get<PaginatedResponse<AuditLog>>(`/audit-logs/?${qs.toString()}`);
    return response.data;
};

export default {
    getAuditLogs,
};
