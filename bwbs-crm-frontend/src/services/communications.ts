import api from './api';

// ============================================================================
// COMMUNICATIONS SERVICE - BWBS Education CRM
// ============================================================================

export type CommunicationType = 'CALL' | 'EMAIL' | 'SMS' | 'MEETING' | 'WHATSAPP' | 'OTHER';
export type CommunicationDirection = 'INBOUND' | 'OUTBOUND';

export interface CommunicationLog {
    id: string;
    student: string;
    student_details?: {
        id: string;
        student_code: string;
        full_name: string;
        email: string;
        status: string;
    };
    communication_type: CommunicationType;
    communication_type_display?: string;
    direction: CommunicationDirection;
    direction_display?: string;
    subject?: string | null;
    summary: string;
    next_action?: string | null;
    follow_up_at?: string | null;
    logged_by?: string | null;
    logged_by_details?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: string;
    } | null;
    created_at: string;
}

export interface CommunicationCreateData {
    student: string;
    communication_type: CommunicationType;
    direction: CommunicationDirection;
    subject?: string;
    summary: string;
    next_action?: string;
    follow_up_at?: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface CommunicationQuery {
    communication_type?: CommunicationType | '';
    direction?: CommunicationDirection | '';
    student?: string;
    search?: string;
    ordering?: string;
    page?: number;
}

export const getCommunications = async (params: CommunicationQuery = {}): Promise<PaginatedResponse<CommunicationLog>> => {
    const qs = new URLSearchParams();
    if (params.communication_type) qs.append('communication_type', params.communication_type);
    if (params.direction) qs.append('direction', params.direction);
    if (params.student) qs.append('student', params.student);
    if (params.search) qs.append('search', params.search);
    if (params.ordering) qs.append('ordering', params.ordering);
    if (params.page) qs.append('page', String(params.page));

    const response = await api.get<PaginatedResponse<CommunicationLog>>(`/communications/?${qs.toString()}`);
    return response.data;
};

export const getStudentCommunications = async (studentId: string): Promise<PaginatedResponse<CommunicationLog>> => {
    const response = await api.get<PaginatedResponse<CommunicationLog>>(`/students/${studentId}/communications/`);
    return response.data;
};

export const createCommunication = async (data: CommunicationCreateData): Promise<CommunicationLog> => {
    const response = await api.post<CommunicationLog>('/communications/', data);
    return response.data;
};

export default {
    getCommunications,
    getStudentCommunications,
    createCommunication,
};
