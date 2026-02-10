import api from './api';

// ============================================================================
// APPLICATIONS SERVICE - BWBS Education CRM
// ============================================================================

export type ApplicationStatus =
    | 'DRAFT'
    | 'DOCUMENTS_READY'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW_SCHEDULED'
    | 'CONDITIONAL_OFFER'
    | 'UNCONDITIONAL_OFFER'
    | 'OFFER_ACCEPTED'
    | 'OFFER_DECLINED'
    | 'CAS_REQUESTED'
    | 'CAS_RECEIVED'
    | 'ENROLLED'
    | 'REJECTED'
    | 'WITHDRAWN';

export interface ChecklistProgress {
    total: number;
    completed: number;
    percent: number;
}

export interface AssignedUser {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
}

export interface ApplicationNote {
    id: string;
    application: string;
    note: string;
    visibility: 'INTERNAL' | 'TEAM';
    is_pinned: boolean;
    created_at: string;
    created_by_details?: AssignedUser;
}

export interface ApplicationChecklistItem {
    id: string;
    application: string;
    title: string;
    category: string;
    status: 'MISSING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'WAIVED';
    is_required: boolean;
    due_date?: string | null;
    submitted_at?: string | null;
    verified_at?: string | null;
    notes?: string | null;
    document_details?: {
        id: string;
        document_type: string;
        file_name: string;
    };
}

export interface Application {
    id: string;
    student: {
        id?: string;
        name?: string;
        student_code?: string;
    } | null;
    student_name?: string;
    student_code?: string;
    student_id?: string;
    university: {
        id?: string;
        name?: string;
        country?: string;
    } | null;
    university_name_display?: string;
    course: {
        id?: string;
        name?: string;
        level?: string;
        duration?: string;
    } | null;
    course_name_display?: string;
    intake: string; // e.g., "September 2026"
    intake_date: string;
    status: ApplicationStatus;
    status_display?: string;
    priority: number;
    application_ref: string | null;
    assigned_to?: string;
    assigned_to_details?: AssignedUser;
    fit_score?: number;
    risk_score?: number;
    target_offer_date?: string | null;
    target_cas_date?: string | null;
    next_action_at?: string | null;
    last_activity_at?: string | null;
    risk_flags?: string[];
    checklist_progress?: ChecklistProgress;
    checklist_items?: ApplicationChecklistItem[];
    collab_notes?: ApplicationNote[];
    submission_details?: {
        id: string;
        portal_url?: string | null;
        portal_username?: string | null;
        portal_notes?: string | null;
        submitted_at?: string | null;
        submission_reference?: string | null;
        artifact?: string | null;
        status: string;
        status_display?: string;
    };
    submitted_at: string | null;
    decision_at: string | null;
    cas_number: string | null;
    cas_received_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApplicationCreateData {
    student: string;
    university_id: string;
    course_id: string;
    intake: string;
    intake_date: string;
    notes?: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET APPLICATIONS - Fetch applications for a student
// ============================================================================
// Filter params
export interface ApplicationFilterParams {
    student?: string;
    search?: string; // Student name or code
    status?: string; // Comma-separated list for backend
    university?: string;
    counselor?: string;
    intake?: string;
    assigned_to?: string;
    priority?: string;
    page?: number;
}

export interface ApplicationTimelineItem {
    id: string;
    from_status: ApplicationStatus | null;
    to_status: ApplicationStatus;
    changed_by: string | null;
    changed_by_details?: AssignedUser;
    changed_at: string;
    note: string | null;
}

// ============================================================================
// GET APPLICATIONS - Fetch applications with filters
// ============================================================================
export const getApplications = async (params: ApplicationFilterParams = {}): Promise<PaginatedResponse<Application>> => {
    const query = new URLSearchParams();

    if (params.student) query.append('student', params.student);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status__in', params.status); // Assuming Django filter backend
    if (params.university) query.append('university', params.university);
    if (params.counselor) query.append('student__counselor', params.counselor);
    if (params.intake) query.append('intake', params.intake);
    if (params.assigned_to) query.append('assigned_to', params.assigned_to);
    if (params.priority) query.append('priority', params.priority);
    if (params.page) query.append('page', params.page.toString());

    const response = await api.get<PaginatedResponse<Application>>(`/applications/?${query.toString()}`);
    return response.data;
};

// ============================================================================
// GET APPLICATION TIMELINE
// ============================================================================
export const getApplicationTimeline = async (id: string): Promise<ApplicationTimelineItem[]> => {
    // Assuming backend endpoint exists, otherwise fallback to empty list
    try {
        const response = await api.get<ApplicationTimelineItem[]>(`/applications/${id}/timeline/`);
        return response.data;
    } catch (error) {
        console.warn('Timeline endpoint not found, returning empty', error);
        return [];
    }
};

// ============================================================================
// GET APPLICATION BY ID
// ============================================================================
export const getApplicationById = async (id: string): Promise<Application> => {
    const response = await api.get<Application>(`/applications/${id}/`);
    return response.data;
};

// ============================================================================
// CREATE APPLICATION
// ============================================================================
export const createApplication = async (data: ApplicationCreateData): Promise<Application> => {
    const response = await api.post<Application>('/applications/', data);
    return response.data;
};

// ============================================================================
// UPDATE APPLICATION STATUS
// ============================================================================
export const updateApplicationStatus = async (id: string, status: ApplicationStatus): Promise<Application> => {
    const response = await api.patch<Application>(`/applications/${id}/`, { status });
    return response.data;
};

export const assignApplication = async (id: string, assigned_to: string): Promise<Application> => {
    const response = await api.patch<Application>(`/applications/${id}/`, { assigned_to });
    return response.data;
};

export const getApplicationChecklist = async (applicationId: string): Promise<ApplicationChecklistItem[]> => {
    const response = await api.get<{ results: ApplicationChecklistItem[] }>(`/application-checklist-items/?application=${applicationId}`);
    return response.data.results;
};

export const updateChecklistItem = async (id: string, data: Partial<ApplicationChecklistItem>): Promise<ApplicationChecklistItem> => {
    const response = await api.patch<ApplicationChecklistItem>(`/application-checklist-items/${id}/`, data);
    return response.data;
};

export const getApplicationNotes = async (applicationId: string): Promise<ApplicationNote[]> => {
    const response = await api.get<{ results: ApplicationNote[] }>(`/application-notes/?application=${applicationId}`);
    return response.data.results;
};

export const createApplicationNote = async (data: { application: string; note: string; visibility?: 'INTERNAL' | 'TEAM' }): Promise<ApplicationNote> => {
    const response = await api.post<ApplicationNote>('/application-notes/', data);
    return response.data;
};

// ============================================================================
// DELETE APPLICATION
// ============================================================================
export const deleteApplication = async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}/`);
};

// Status labels and colors
export const statusLabels: Record<ApplicationStatus, string> = {
    DRAFT: 'Draft',
    DOCUMENTS_READY: 'Documents Ready',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    CONDITIONAL_OFFER: 'Conditional Offer',
    UNCONDITIONAL_OFFER: 'Unconditional Offer',
    OFFER_ACCEPTED: 'Offer Accepted',
    OFFER_DECLINED: 'Offer Declined',
    CAS_REQUESTED: 'CAS Requested',
    CAS_RECEIVED: 'CAS Received',
    ENROLLED: 'Enrolled',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
};

export const statusColors: Record<ApplicationStatus, string> = {
    DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    DOCUMENTS_READY: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    UNDER_REVIEW: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    INTERVIEW_SCHEDULED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    CONDITIONAL_OFFER: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    UNCONDITIONAL_OFFER: 'bg-green-500/20 text-green-400 border-green-500/30',
    OFFER_ACCEPTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    OFFER_DECLINED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    CAS_REQUESTED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    CAS_RECEIVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ENROLLED: 'bg-[#AD03DE]/20 text-[#AD03DE] border-[#AD03DE]/30',
    REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    WITHDRAWN: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// Status workflow
export const statusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    DRAFT: ['DOCUMENTS_READY', 'WITHDRAWN'],
    DOCUMENTS_READY: ['SUBMITTED', 'WITHDRAWN'],
    SUBMITTED: ['UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'REJECTED', 'WITHDRAWN'],
    UNDER_REVIEW: ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'REJECTED', 'WITHDRAWN'],
    INTERVIEW_SCHEDULED: ['UNDER_REVIEW', 'CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'REJECTED', 'WITHDRAWN'],
    CONDITIONAL_OFFER: ['UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'CAS_REQUESTED', 'REJECTED', 'WITHDRAWN'],
    UNCONDITIONAL_OFFER: ['OFFER_ACCEPTED', 'OFFER_DECLINED', 'CAS_REQUESTED', 'WITHDRAWN'],
    OFFER_ACCEPTED: ['CAS_REQUESTED', 'WITHDRAWN'],
    OFFER_DECLINED: ['WITHDRAWN'],
    CAS_REQUESTED: ['CAS_RECEIVED', 'WITHDRAWN'],
    CAS_RECEIVED: ['ENROLLED', 'WITHDRAWN'],
    ENROLLED: [],
    REJECTED: [],
    WITHDRAWN: [],
};

export default {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    assignApplication,
    deleteApplication,
    getApplicationChecklist,
    updateChecklistItem,
    getApplicationNotes,
    createApplicationNote,
};
