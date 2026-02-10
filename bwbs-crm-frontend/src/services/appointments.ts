import api from './api';

// ============================================================================
// APPOINTMENTS SERVICE - BWBS Education CRM
// ============================================================================

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentMethod = 'IN_PERSON' | 'PHONE' | 'VIDEO';
export type ReminderChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

export interface Appointment {
    id: string;
    student: string;
    student_details?: {
        id: string;
        student_code: string;
        full_name: string;
        email: string;
    };
    counselor: string;
    counselor_details?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    scheduled_start: string;
    scheduled_end: string;
    method: AppointmentMethod;
    method_display?: string;
    location: string | null;
    meeting_link: string | null;
    status: AppointmentStatus;
    status_display?: string;
    notes: string | null;
    reminder_minutes: number;
    created_by: string | null;
    cancelled_reason: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface AppointmentCreateData {
    student: string;
    counselor: string;
    scheduled_start: string;
    scheduled_end: string;
    method?: AppointmentMethod;
    location?: string;
    meeting_link?: string;
    notes?: string;
    reminder_minutes?: number;
}

export interface AppointmentReminder {
    id: string;
    appointment: string;
    channel: ReminderChannel;
    channel_display?: string;
    status: 'SENT' | 'FAILED';
    sent_at: string;
    error_message: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface AppointmentQuery {
    status?: AppointmentStatus | '';
    method?: AppointmentMethod | '';
    counselor?: string;
    student?: string;
    search?: string;
    ordering?: string;
    page?: number;
}

export const getAppointments = async (params: AppointmentQuery = {}): Promise<PaginatedResponse<Appointment>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.method) qs.append('method', params.method);
    if (params.counselor) qs.append('counselor', params.counselor);
    if (params.student) qs.append('student', params.student);
    if (params.search) qs.append('search', params.search);
    if (params.ordering) qs.append('ordering', params.ordering);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<Appointment>>(`/appointments/?${qs.toString()}`);
    return response.data;
};

export const getAppointment = async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}/`);
    return response.data;
};

export const createAppointment = async (data: AppointmentCreateData): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments/', data);
    return response.data;
};

export const updateAppointment = async (id: string, data: Partial<AppointmentCreateData>): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/`, data);
    return response.data;
};

export const deleteAppointment = async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}/`);
};

export const getReminders = async (params: { page?: number } = {}): Promise<PaginatedResponse<AppointmentReminder>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<AppointmentReminder>>(`/appointment-reminders/?${qs.toString()}`);
    return response.data;
};

export default {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getReminders,
};
