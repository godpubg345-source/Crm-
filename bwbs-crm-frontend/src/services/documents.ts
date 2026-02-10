import api from './api';

// ============================================================================
// DOCUMENTS SERVICE - BWBS Education CRM
// ============================================================================

// Backend-aligned category choices (from Document.Category in students/models.py)
export type DocumentCategory =
    | 'PASSPORT' | 'NATIONAL_ID' | 'TRANSCRIPT' | 'CERTIFICATE'
    | 'ENGLISH_TEST' | 'BANK_STATEMENT' | 'SPONSOR_LETTER'
    | 'SOP' | 'CV' | 'REFERENCE' | 'OFFER_LETTER'
    | 'CAS' | 'VISA' | 'OTHER';

export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface Document {
    id: string;
    student: string;
    application?: string | null;
    category: DocumentCategory;
    document_type: string;
    file_name: string;
    file: string;
    file_size: number;
    mime_type: string;
    verification_status: VerificationStatus;
    verified_by: {
        id: string;
        first_name: string;
        last_name: string;
    } | null;
    verified_at: string | null;
    rejection_reason: string | null;
    is_current: boolean;
    expiry_date: string | null;
    uploaded_by: {
        id: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
    updated_at: string;
}

export interface DocumentUploadData {
    student: string;
    application?: string;
    category: DocumentCategory;
    document_type: string;
    file: File;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET DOCUMENTS - Fetch documents for a student
// ============================================================================
export const getDocuments = async (studentId: string, applicationId?: string): Promise<PaginatedResponse<Document>> => {
    const query = new URLSearchParams();
    query.append('student', studentId);
    if (applicationId) query.append('application', applicationId);
    const response = await api.get<PaginatedResponse<Document>>(`/documents/?${query.toString()}`);
    return response.data;
};

// ============================================================================
// GET DOCUMENT BY ID
// ============================================================================
export const getDocumentById = async (id: string): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${id}/`);
    return response.data;
};

// ============================================================================
// UPLOAD DOCUMENT
// ============================================================================
export const uploadDocument = async (data: DocumentUploadData): Promise<Document> => {
    const formData = new FormData();

    // Ensure category is always set (fallback to document_type if missing)
    const categoryToSend = data.category || data.document_type;

    formData.append('student', data.student);
    if (data.application) {
        formData.append('application', data.application);
    }
    formData.append('category', categoryToSend);
    formData.append('document_type', data.document_type);
    formData.append('file', data.file);
    formData.append('title', data.file.name); // Auto-use filename as title

    const response = await api.post<Document>('/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// ============================================================================
// DELETE DOCUMENT
// ============================================================================
export const deleteDocument = async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}/`);
};

// ============================================================================
// VERIFY DOCUMENT
// ============================================================================
export const verifyDocument = async (id: string, status: VerificationStatus, reason?: string): Promise<Document> => {
    const response = await api.patch<Document>(`/documents/${id}/`, {
        verification_status: status,
        rejection_reason: reason,
    });
    return response.data;
};

// Document category labels (matches backend Document.Category)
export const categoryLabels: Record<DocumentCategory, string> = {
    PASSPORT: 'Passport',
    NATIONAL_ID: 'National ID',
    TRANSCRIPT: 'Academic Transcript',
    CERTIFICATE: 'Certificate',
    ENGLISH_TEST: 'English Test Score',
    BANK_STATEMENT: 'Bank Statement',
    SPONSOR_LETTER: 'Sponsor Letter',
    SOP: 'Statement of Purpose',
    CV: 'CV/Resume',
    REFERENCE: 'Reference Letter',
    OFFER_LETTER: 'Offer Letter',
    CAS: 'CAS Document',
    VISA: 'Visa Document',
    OTHER: 'Other',
};

// All category options for dropdowns
export const categoryOptions: { value: DocumentCategory; label: string }[] = [
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'NATIONAL_ID', label: 'National ID' },
    { value: 'TRANSCRIPT', label: 'Academic Transcript' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'ENGLISH_TEST', label: 'English Test Score' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'SPONSOR_LETTER', label: 'Sponsor Letter' },
    { value: 'SOP', label: 'Statement of Purpose' },
    { value: 'CV', label: 'CV/Resume' },
    { value: 'REFERENCE', label: 'Reference Letter' },
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'CAS', label: 'CAS Document' },
    { value: 'VISA', label: 'Visa Document' },
    { value: 'OTHER', label: 'Other' },
];

export default {
    getDocuments,
    getDocumentById,
    uploadDocument,
    deleteDocument,
    verifyDocument,
};
