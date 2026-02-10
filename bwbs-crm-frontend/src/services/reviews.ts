import api from './api';

// ============================================================================
// REVIEWS SERVICE - BWBS Education CRM
// ============================================================================

export type ReviewStatus = 'PENDING' | 'ASSIGNED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
export type SLAStatus = 'ON_TIME' | 'LATE' | 'UNKNOWN';

export interface ReviewSLA {
    id: string;
    category: string;
    category_display?: string;
    target_hours: number;
    is_active: boolean;
    notes: string | null;
    created_at: string;
}

export interface DocumentReview {
    id: string;
    document: string;
    document_details?: {
        id: string;
        file_name: string;
        category: string;
        category_display: string;
        student: string;
        student_details?: { id: string; full_name: string; student_code: string };
    };
    status: ReviewStatus;
    status_display?: string;
    reviewer: string | null;
    reviewer_details?: { id: string; first_name: string; last_name: string; email: string };
    assigned_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    due_at: string | null;
    sla_minutes: number | null;
    sla_status: SLAStatus;
    sla_status_display?: string;
    notes: string | null;
    rejection_reason: string | null;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ReviewQuery {
    status?: ReviewStatus | '';
    sla_status?: SLAStatus | '';
    reviewer?: string;
    page?: number;
}

// Review SLAs
export const getReviewSLAs = async (params: { page?: number } = {}): Promise<PaginatedResponse<ReviewSLA>> => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<ReviewSLA>>(`/review-slas/?${qs.toString()}`);
    return response.data;
};

export const createReviewSLA = async (data: Partial<ReviewSLA>): Promise<ReviewSLA> => {
    const response = await api.post<ReviewSLA>('/review-slas/', data);
    return response.data;
};

export const updateReviewSLA = async (id: string, data: Partial<ReviewSLA>): Promise<ReviewSLA> => {
    const response = await api.patch<ReviewSLA>(`/review-slas/${id}/`, data);
    return response.data;
};

// Document Reviews
export const getDocumentReviews = async (params: ReviewQuery = {}): Promise<PaginatedResponse<DocumentReview>> => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.sla_status) qs.append('sla_status', params.sla_status);
    if (params.reviewer) qs.append('reviewer', params.reviewer);
    if (params.page) qs.append('page', String(params.page));
    const response = await api.get<PaginatedResponse<DocumentReview>>(`/document-reviews/?${qs.toString()}`);
    return response.data;
};

export const updateDocumentReview = async (id: string, data: Partial<DocumentReview>): Promise<DocumentReview> => {
    const response = await api.patch<DocumentReview>(`/document-reviews/${id}/`, data);
    return response.data;
};

export default {
    getReviewSLAs,
    createReviewSLA,
    updateReviewSLA,
    getDocumentReviews,
    updateDocumentReview,
};
