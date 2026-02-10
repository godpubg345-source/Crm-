import api from './api';

// ============================================================================
// VISA SERVICE - BWBS Education CRM
// ============================================================================

export type VisaOutcome = 'PENDING' | 'GRANTED' | 'REFUSED' | 'WITHDRAWN';

export interface VisaCase {
    id: string;
    student: string;
    student_details?: {
        id: string;
        student_code: string;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
        phone: string;
    };
    application: string | null;
    cas_number: string | null;
    status: string;
    status_display: string;
    decision_status: string;
    decision_status_display: string;
    vfs_date: string | null;
    vfs_location: string | null;
    biometric_done: boolean;
    tb_test_done: boolean;
    tb_test_date: string | null;
    ihs_reference: string | null;
    ihs_amount: number | null;
    visa_fee_amount: number | null;
    submission_date: string | null;
    decision_date: string | null;
    visa_start_date: string | null;
    visa_end_date: string | null;
    refusal_reason: string | null;
    appeal_submitted: boolean;
    appeal_date: string | null;
    notes: string | null;
    priority?: 'NORMAL' | 'URGENT';
    created_at: string;
    updated_at: string;
}

export interface VisaCaseCreateData {
    student: string;
    application?: string;
    cas_number?: string;
    priority?: 'NORMAL' | 'URGENT';
}

export interface VisaCaseUpdateData {
    cas_number?: string | null;
    status?: string;
    decision_status?: string;
    priority?: 'NORMAL' | 'URGENT';
    vfs_date?: string | null;
    vfs_location?: string | null;
    biometric_done?: boolean;
    tb_test_done?: boolean;
    tb_test_date?: string | null;
    ihs_reference?: string | null;
    ihs_amount?: number | null;
    visa_fee_amount?: number | null;
    submission_date?: string | null;
    decision_date?: string | null;
    visa_start_date?: string | null;
    visa_end_date?: string | null;
    refusal_reason?: string | null;
    appeal_submitted?: boolean;
    appeal_date?: string | null;
    notes?: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET VISA CASES - Fetch visa cases (optional student filter)
// ============================================================================
export const getVisaCases = async (studentId?: string): Promise<PaginatedResponse<VisaCase>> => {
    const query = studentId ? `?student=${studentId}` : '';
    const response = await api.get<PaginatedResponse<VisaCase>>(`/visa-cases/${query}`);
    return response.data;
};

// ============================================================================
// GET VISA CASE BY ID
// ============================================================================
export const getVisaCaseById = async (id: string): Promise<VisaCase> => {
    const response = await api.get<VisaCase>(`/visa-cases/${id}/`);
    return response.data;
};

// ============================================================================
// CREATE VISA CASE
// ============================================================================
export const createVisaCase = async (data: VisaCaseCreateData): Promise<VisaCase> => {
    const response = await api.post<VisaCase>('/visa-cases/', data);
    return response.data;
};

// ============================================================================
// UPDATE VISA CASE
// ============================================================================
export const updateVisaCase = async (id: string, data: VisaCaseUpdateData): Promise<VisaCase> => {
    const response = await api.patch<VisaCase>(`/visa-cases/${id}/`, data);
    return response.data;
};

// ============================================================================
// DELETE VISA CASE
// ============================================================================
export const deleteVisaCase = async (id: string): Promise<void> => {
    await api.delete(`/visa-cases/${id}/`);
};

// Outcome labels and colors
export const outcomeLabels: Record<VisaOutcome, string> = {
    PENDING: 'Pending Decision',
    GRANTED: 'Visa Granted',
    REFUSED: 'Visa Refused',
    WITHDRAWN: 'Withdrawn',
};

export const outcomeColors: Record<VisaOutcome, string> = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    GRANTED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REFUSED: 'bg-rose-50 text-rose-600 border-rose-100',
    WITHDRAWN: 'bg-slate-50 text-slate-600 border-slate-100',
};

// ============================================================================
// VISA MILESTONES
// ============================================================================

export interface VisaMilestone {
    id: string;
    visa_case: string;
    title: string;
    category: 'CAS' | 'VISA' | 'IHS' | 'VFS' | 'BIOMETRICS' | 'OTHER';
    due_date: string | null;
    completed_at: string | null;
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';
    notes: string | null;
}

export interface VisaMilestoneCreateData {
    visa_case: string;
    title: string;
    category?: string;
    due_date?: string;
}

export const getVisaMilestones = async (visaCaseId: string): Promise<PaginatedResponse<VisaMilestone>> => {
    const response = await api.get<PaginatedResponse<VisaMilestone>>(`/visa-milestones/?visa_case=${visaCaseId}`);
    return response.data;
};

export const createVisaMilestone = async (data: VisaMilestoneCreateData): Promise<VisaMilestone> => {
    const response = await api.post<VisaMilestone>('/visa-milestones/', data);
    return response.data;
};

export const updateVisaMilestone = async (id: string, data: Partial<VisaMilestone>): Promise<VisaMilestone> => {
    const response = await api.patch<VisaMilestone>(`/visa-milestones/${id}/`, data);
    return response.data;
};

export const deleteVisaMilestone = async (id: string): Promise<void> => {
    await api.delete(`/visa-milestones/${id}/`);
};

export default {
    getVisaCases,
    getVisaCaseById,
    createVisaCase,
    updateVisaCase,
    deleteVisaCase,
    getVisaMilestones,
    createVisaMilestone,
    updateVisaMilestone,
    deleteVisaMilestone,
    outcomeLabels,
    outcomeColors
};
