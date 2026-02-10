import api from './api';

// ============================================================================
// COMPLIANCE SERVICE - BWBS Education CRM
// ============================================================================

export type ComplianceStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ChangeAction = 'CREATE' | 'UPDATE' | 'ARCHIVE';

export interface ComplianceRule {
    id: string;
    name: string;
    country: string;
    visa_type: string | null;
    description: string | null;
    requirements: Record<string, unknown>;
    status: ComplianceStatus;
    status_display?: string;
    severity: ComplianceSeverity;
    severity_display?: string;
    effective_from: string | null;
    effective_to: string | null;
    source_url: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface ComplianceRuleChange {
    id: string;
    rule: string;
    rule_details?: { id: string; name: string };
    action: ChangeAction;
    action_display?: string;
    changed_by: string | null;
    changed_by_details?: { id: string; first_name: string; last_name: string; email: string };
    change_summary: string | null;
    previous_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
    changed_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ComplianceQuery {
    status?: ComplianceStatus | '';
    severity?: ComplianceSeverity | '';
    country?: string;
    search?: string;
    page?: number;
}

export const getComplianceRules = async (params: ComplianceQuery = {}): Promise<PaginatedResponse<ComplianceRule>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.severity) qs.append('severity', params.severity);
    if (params.country) qs.append('country', params.country);
    if (params.search) qs.append('search', params.search);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<ComplianceRule>>(`/compliance/rules/?${qs.toString()}`);
    return response.data;
};

export const createComplianceRule = async (data: Partial<ComplianceRule>): Promise<ComplianceRule> => {
    const response = await api.post<ComplianceRule>('/compliance/rules/', data);
    return response.data;
};

export const updateComplianceRule = async (id: string, data: Partial<ComplianceRule>): Promise<ComplianceRule> => {
    const response = await api.patch<ComplianceRule>(`/compliance/rules/${id}/`, data);
    return response.data;
};

export const deleteComplianceRule = async (id: string): Promise<void> => {
    await api.delete(`/compliance/rules/${id}/`);
};

export const getComplianceChanges = async (params: { rule?: string; page?: number } = {}): Promise<PaginatedResponse<ComplianceRuleChange>> => {
    const qs = new URLSearchParams();
    if (params.rule) qs.append('rule', params.rule);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<ComplianceRuleChange>>(`/compliance/changes/?${qs.toString()}`);
    return response.data;
};

export default {
    getComplianceRules,
    createComplianceRule,
    updateComplianceRule,
    deleteComplianceRule,
    getComplianceChanges,
};
