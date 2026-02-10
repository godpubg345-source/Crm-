import api from './api';

// ============================================================================
// AUTOMATION SERVICE - BWBS Education CRM
// ============================================================================

export type AutomationTrigger = 'LEAD_CREATED' | 'STUDENT_CREATED' | 'APPLICATION_STATUS_CHANGED' | 'VISA_STATUS_CHANGED' | 'TASK_OVERDUE' | 'DOCUMENT_UPLOADED';
export type RunStatus = 'SUCCESS' | 'FAILED' | 'SKIPPED';
export type EscalationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

export interface AutomationRule {
    id: string;
    name: string;
    description: string | null;
    trigger: AutomationTrigger;
    trigger_display?: string;
    conditions: Record<string, unknown>;
    actions: unknown[];
    priority: number;
    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface AutomationRun {
    id: string;
    rule: string;
    rule_details?: { id: string; name: string; trigger: string };
    status: RunStatus;
    status_display?: string;
    context: Record<string, unknown>;
    error_message: string | null;
    ran_at: string;
}

export interface TaskEscalationPolicy {
    id: string;
    name: string;
    priority: string;
    priority_display?: string;
    escalate_after_hours: number;
    escalate_to_role: string;
    escalate_to_role_display?: string;
    notify_channel: EscalationChannel;
    notify_channel_display?: string;
    is_active: boolean;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface AutomationQuery {
    trigger?: AutomationTrigger | '';
    is_active?: boolean;
    search?: string;
    page?: number;
}

// Automation Rules
export const getAutomationRules = async (params: AutomationQuery = {}): Promise<PaginatedResponse<AutomationRule>> => {
    const qs = new URLSearchParams();
    if (params.trigger) qs.append('trigger', params.trigger);
    if (params.is_active !== undefined) qs.append('is_active', String(params.is_active));
    if (params.search) qs.append('search', params.search);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AutomationRule>>(`/automation/rules/?${qs.toString()}`);
    return response.data;
};

export const createAutomationRule = async (data: Partial<AutomationRule>): Promise<AutomationRule> => {
    const response = await api.post<AutomationRule>('/automation/rules/', data);
    return response.data;
};

export const updateAutomationRule = async (id: string, data: Partial<AutomationRule>): Promise<AutomationRule> => {
    const response = await api.patch<AutomationRule>(`/automation/rules/${id}/`, data);
    return response.data;
};

export const deleteAutomationRule = async (id: string): Promise<void> => {
    await api.delete(`/automation/rules/${id}/`);
};

// Automation Runs
export const getAutomationRuns = async (params: { status?: RunStatus; page?: number } = {}): Promise<PaginatedResponse<AutomationRun>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AutomationRun>>(`/automation/runs/?${qs.toString()}`);
    return response.data;
};

// Escalation Policies
export const getEscalationPolicies = async (params: { page?: number } = {}): Promise<PaginatedResponse<TaskEscalationPolicy>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<TaskEscalationPolicy>>(`/automation/escalations/?${qs.toString()}`);
    return response.data;
};

export const createEscalationPolicy = async (data: Partial<TaskEscalationPolicy>): Promise<TaskEscalationPolicy> => {
    const response = await api.post<TaskEscalationPolicy>('/automation/escalations/', data);
    return response.data;
};

export const updateEscalationPolicy = async (id: string, data: Partial<TaskEscalationPolicy>): Promise<TaskEscalationPolicy> => {
    const response = await api.patch<TaskEscalationPolicy>(`/automation/escalations/${id}/`, data);
    return response.data;
};

export const deleteEscalationPolicy = async (id: string): Promise<void> => {
    await api.delete(`/automation/escalations/${id}/`);
};

export default {
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    getAutomationRuns,
    getEscalationPolicies,
    createEscalationPolicy,
    updateEscalationPolicy,
    deleteEscalationPolicy,
};
