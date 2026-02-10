import api from './api';

// ============================================================================
// OPERATIONS SERVICE - BWBS Education CRM
// ============================================================================

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type AgentStatus = 'ACTIVE' | 'INACTIVE';
export type OCRJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PartnerContract {
    id: string;
    university: string;
    university_details?: { id: string; name: string; country: string };
    contract_number: string | null;
    start_date: string;
    end_date: string | null;
    days_until_expiry?: number | null;
    commission_terms: Record<string, unknown>;
    notes: string | null;
    status: ContractStatus;
    status_display?: string;
    created_at: string;
}

export interface Agent {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    country: string | null;
    parent_agent: string | null;
    parent_agent_name?: string;
    sub_agents_count?: number;
    commission_rate: string;
    status: AgentStatus;
    status_display?: string;
    notes: string | null;
    created_at: string;
}

export interface AgentStats {
    total_assignments: number;
    primary_roles: number;
    secondary_roles: number;
    student_count: number;
    lead_count: number;
}

export interface AgentAssignment {
    id: string;
    agent: string;
    agent_details?: { id: string; name: string };
    lead: string | null;
    lead_details?: { id: string; full_name: string };
    student: string | null;
    student_details?: { id: string; full_name: string; student_code: string };
    role: 'PRIMARY' | 'SECONDARY';
    role_display?: string;
    notes: string | null;
    created_at: string;
}

export interface OCRJob {
    id: string;
    document: string;
    document_details?: { id: string; file_name: string; category: string };
    status: OCRJobStatus;
    status_display?: string;
    provider: string | null;
    requested_by: string | null;
    requested_by_details?: { id: string; first_name: string; last_name: string };
    processed_at: string | null;
    raw_text: string | null;
    extracted_data: Record<string, unknown>;
    classification_label: string | null;
    confidence: string | null;
    error_message: string | null;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Partner Contracts
export const getPartnerContracts = async (params: { status?: ContractStatus; page?: number } = {}): Promise<PaginatedResponse<PartnerContract>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<PartnerContract>>(`/operations/contracts/?${qs.toString()}`);
    return response.data;
};

export const createPartnerContract = async (data: Partial<PartnerContract>): Promise<PartnerContract> => {
    const response = await api.post<PartnerContract>('/operations/contracts/', data);
    return response.data;
};

export const updatePartnerContract = async (id: string, data: Partial<PartnerContract>): Promise<PartnerContract> => {
    const response = await api.patch<PartnerContract>(`/operations/contracts/${id}/`, data);
    return response.data;
};

// Agents
export const getAgents = async (params: { status?: AgentStatus; page?: number } = {}): Promise<PaginatedResponse<Agent>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<Agent>>(`/operations/agents/?${qs.toString()}`);
    return response.data;
};

export const createAgent = async (data: Partial<Agent>): Promise<Agent> => {
    const response = await api.post<Agent>('/operations/agents/', data);
    return response.data;
};

export const updateAgent = async (id: string, data: Partial<Agent>): Promise<Agent> => {
    const response = await api.patch<Agent>(`/operations/agents/${id}/`, data);
    return response.data;
};

export const deleteAgent = async (id: string): Promise<void> => {
    await api.delete(`/operations/agents/${id}/`);
};

export const getAgentStats = async (id: string): Promise<AgentStats> => {
    const response = await api.get<AgentStats>(`/operations/agents/${id}/stats/`);
    return response.data;
};

// Agent Assignments
export const getAgentAssignments = async (params: { agent?: string; page?: number } = {}): Promise<PaginatedResponse<AgentAssignment>> => {
    const qs = new URLSearchParams();
    if (params.agent) qs.append('agent', params.agent);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AgentAssignment>>(`/operations/agent-assignments/?${qs.toString()}`);
    return response.data;
};

export const createAgentAssignment = async (data: Partial<AgentAssignment>): Promise<AgentAssignment> => {
    const response = await api.post<AgentAssignment>('/operations/agent-assignments/', data);
    return response.data;
};

// OCR Jobs
export const getOCRJobs = async (params: { status?: OCRJobStatus; page?: number } = {}): Promise<PaginatedResponse<OCRJob>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<OCRJob>>(`/operations/ocr-jobs/?${qs.toString()}`);
    return response.data;
};

export const createOCRJob = async (data: Partial<OCRJob>): Promise<OCRJob> => {
    const response = await api.post<OCRJob>('/operations/ocr-jobs/', data);
    return response.data;
};

export const triggerOCRJob = async (id: string): Promise<{ status: string }> => {
    const response = await api.post<{ status: string }>(`/operations/ocr-jobs/${id}/trigger_ocr/`);
    return response.data;
};

export default {
    getPartnerContracts,
    createPartnerContract,
    updatePartnerContract,
    getAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgentStats,
    getAgentAssignments,
    createAgentAssignment,
    getOCRJobs,
    createOCRJob,
    triggerOCRJob,
};
