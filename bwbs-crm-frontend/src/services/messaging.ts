import api from './api';

// ============================================================================
// MESSAGING SERVICE - BWBS Education CRM
// ============================================================================

export type MessageChannel = 'EMAIL' | 'SMS' | 'WHATSAPP';
export type MessageStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'DELIVERED';

export interface MessageTemplate {
    id: string;
    name: string;
    channel: MessageChannel;
    channel_display?: string;
    subject: string | null;
    body: string;
    variables: string[];
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface MessageLog {
    id: string;
    template: string | null;
    template_details?: { id: string; name: string };
    channel: MessageChannel;
    channel_display?: string;
    recipient: string;
    subject: string | null;
    body: string | null;
    status: MessageStatus;
    status_display?: string;
    lead: string | null;
    student: string | null;
    student_details?: { id: string; full_name: string; student_code: string };
    lead_details?: { id: string; full_name: string };
    provider_name: string | null;
    provider_message_id: string | null;
    error_message: string | null;
    triggered_by: string | null;
    triggered_by_details?: { id: string; first_name: string; last_name: string };
    sent_at: string | null;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface MessageTemplateQuery {
    channel?: MessageChannel | '';
    is_active?: boolean;
    search?: string;
    page?: number;
}

export interface MessageLogQuery {
    channel?: MessageChannel | '';
    status?: MessageStatus | '';
    page?: number;
}

// Message Templates
export const getMessageTemplates = async (params: MessageTemplateQuery = {}): Promise<PaginatedResponse<MessageTemplate>> => {
    const qs = new URLSearchParams();
    if (params.channel) qs.append('channel', params.channel);
    if (params.is_active !== undefined) qs.append('is_active', String(params.is_active));
    if (params.search) qs.append('search', params.search);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<MessageTemplate>>(`/messaging/templates/?${qs.toString()}`);
    return response.data;
};

export const createMessageTemplate = async (data: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    const response = await api.post<MessageTemplate>('/messaging/templates/', data);
    return response.data;
};

export const updateMessageTemplate = async (id: string, data: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    const response = await api.patch<MessageTemplate>(`/messaging/templates/${id}/`, data);
    return response.data;
};

export const deleteMessageTemplate = async (id: string): Promise<void> => {
    await api.delete(`/messaging/templates/${id}/`);
};

// Message Logs
export const getMessageLogs = async (params: MessageLogQuery = {}): Promise<PaginatedResponse<MessageLog>> => {
    const qs = new URLSearchParams();
    if (params.channel) qs.append('channel', params.channel);
    if (params.status) qs.append('status', params.status);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<MessageLog>>(`/messaging/logs/?${qs.toString()}`);
    return response.data;
};

export default {
    getMessageTemplates,
    createMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    getMessageLogs,
};
