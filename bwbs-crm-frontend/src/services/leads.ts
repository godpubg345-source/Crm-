import api from './api';

// ============================================================================
// LEADS SERVICE - BWBS Education CRM
// ============================================================================

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type LeadSource = 'WALK_IN' | 'WEBSITE' | 'FACEBOOK' | 'REFERRAL' | 'EVENT' | 'OTHER';
export type LeadPriority = 'HOT' | 'WARM' | 'COLD';
export type InteractionType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE';

export interface Lead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: LeadSource;
    status: LeadStatus;
    notes: string;
    priority: LeadPriority;
    priority_display: string;
    score: number;
    target_country: string | null;
    is_sla_violated: boolean;
    win_probability: number;
    last_interaction_at: string | null;
    assigned_to?: string | null;
    assigned_to_details?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface LeadInteraction {
    id: string;
    lead: string;
    staff: string;
    staff_details?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    type: InteractionType;
    type_display: string;
    content: string;
    audio_file?: string | null;
    timestamp: string;
}

export interface CounselorAvailability {
    id: string;
    user: string;
    user_name: string;
    day_of_week: number;
    day_name: string;
    start_time: string;
    end_time: string;
}

export interface WhatsAppTemplate {
    id: string;
    title: string;
    category: 'FOLLOW_UP' | 'BROCHURE' | 'DOCUMENT_REQ' | 'GREETING' | 'OTHER';
    category_display: string;
    formatted_message: string;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    conversions: number;
    hot_leads: number;
    total_leads: number;
    rank_emoji: string;
}

export interface LeadInteractionCreateData {
    lead: string;
    type: InteractionType;
    content: string;
    audio_file?: Blob | File;
}

export interface LeadCreateData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    source: LeadSource;
    target_country?: string;
    status?: LeadStatus;
    notes?: string;
    assigned_to?: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET LEADS
// ============================================================================
export const getLeads = async (status?: LeadStatus): Promise<PaginatedResponse<Lead>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get<PaginatedResponse<Lead>>(`/leads/?${params.toString()}`);
    return response.data;
};

// ============================================================================
// GET LEAD BY ID
// ============================================================================
export const getLeadById = async (id: string): Promise<Lead> => {
    const response = await api.get<Lead>(`/leads/${id}/`);
    return response.data;
};

// ============================================================================
// CREATE LEAD
// ============================================================================
export const createLead = async (data: LeadCreateData): Promise<Lead> => {
    const response = await api.post<Lead>('/leads/', data);
    return response.data;
};

// ============================================================================
// UPDATE LEAD
// ============================================================================
export const updateLead = async (id: string, data: Partial<LeadCreateData>): Promise<Lead> => {
    const response = await api.patch<Lead>(`/leads/${id}/`, data);
    return response.data;
};

// ============================================================================
// CONVERT LEAD
// ============================================================================
export const convertLead = async (id: string): Promise<{ student_id: string; message: string }> => {
    const response = await api.post<{ student_id: string; message: string }>(`/leads/${id}/convert/`);
    return response.data;
};

// ============================================================================
// INTERACTIONS
// ============================================================================
export const getLeadInteractions = async (leadId: string): Promise<LeadInteraction[]> => {
    const response = await api.get<LeadInteraction[]>(`/leads/${leadId}/interactions/`);
    return response.data;
};

export const createLeadInteraction = async (data: LeadInteractionCreateData): Promise<LeadInteraction> => {
    const formData = new FormData();
    formData.append('lead', data.lead);
    formData.append('type', data.type);
    formData.append('content', data.content);

    if (data.audio_file) {
        formData.append('audio_file', data.audio_file, 'interaction_voice_note.webm');
    }

    const response = await api.post<LeadInteraction>('/lead-interactions/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ============================================================================
// WHATSAPP TEMPLATES
// ============================================================================
export const getWhatsAppTemplates = async (leadId: string): Promise<WhatsAppTemplate[]> => {
    const response = await api.get<PaginatedResponse<WhatsAppTemplate> | WhatsAppTemplate[]>(`/leads/${leadId}/whatsapp_templates/`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && 'results' in data) return data.results;
    return [];
};

export const getWhatsAppTemplatesList = async (): Promise<WhatsAppTemplate[]> => {
    const response = await api.get<PaginatedResponse<WhatsAppTemplate> | WhatsAppTemplate[]>('/lead-whatsapp-templates/');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && 'results' in data) return data.results;
    return [];
};

// ============================================================================
// LEADERBOARD
// ============================================================================
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get<LeaderboardEntry[]>('/leads/leaderboard/');
    return response.data;
};

// ============================================================================
// PHASE 3: BULK ACTIONS & DUPLICATES
// ============================================================================
export const bulkLeadAction = async (data: {
    lead_ids: string[];
    action: 'ASSIGN' | 'STATUS_UPDATE' | 'WHATSAPP_TEMPLATE';
    assigned_to?: string;
    status?: LeadStatus;
    template_id?: number;
}): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/leads/bulk-action/', data);
    return response.data;
};

export const checkDuplicateLead = async (params: { email?: string; phone?: string }): Promise<{
    exists: boolean;
    lead?: { id: string; full_name: string; status: string; staff: string };
}> => {
    const response = await api.get<{
        exists: boolean;
        lead?: { id: string; full_name: string; status: string; staff: string };
    }>('/leads/check_duplicate/', { params });
    return response.data;
};

// ============================================================================
// COUNSELOR AVAILABILITY
// ============================================================================
export const getCounselorAvailability = async (): Promise<CounselorAvailability[]> => {
    const response = await api.get<CounselorAvailability[]>('/counselor-availability/');
    return response.data;
};

export const createCounselorAvailability = async (data: Partial<CounselorAvailability>): Promise<CounselorAvailability> => {
    const response = await api.post<CounselorAvailability>('/counselor-availability/', data);
    return response.data;
};

export const deleteCounselorAvailability = async (id: string): Promise<void> => {
    await api.delete(`/counselor-availability/${id}/`);
};

// Status Config
export const leadStatusColors: Record<LeadStatus, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    CONTACTED: 'bg-amber-100 text-amber-700 border-amber-200',
    QUALIFIED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CONVERTED: 'bg-purple-100 text-purple-700 border-purple-200',
    LOST: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const leadStatusLabels: Record<LeadStatus, string> = {
    NEW: 'New',
    CONTACTED: 'Contacted',
    QUALIFIED: 'Qualified',
    CONVERTED: 'Converted',
    LOST: 'Lost',
};

export const leadPriorityColors: Record<LeadPriority, string> = {
    HOT: 'bg-rose-500 text-white border-rose-600 shadow-rose-200',
    WARM: 'bg-amber-100 text-amber-700 border-amber-200',
    COLD: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const interactionIcons: Record<InteractionType, string> = {
    CALL: 'phone',
    WHATSAPP: 'message-circle',
    EMAIL: 'mail',
    MEETING: 'users',
    NOTE: 'file-text',
};

export default {
    createLeadInteraction,
    getWhatsAppTemplates,
    getLeaderboard,
    bulkLeadAction,
    checkDuplicateLead,
    getCounselorAvailability,
    createCounselorAvailability,
    deleteCounselorAvailability,
};
