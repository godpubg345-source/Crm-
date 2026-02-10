import api from './api';

export interface MagicLinkResponse {
    url: string;
    expires_at: string;
    id: string;
}

export const createMagicLink = async (studentId: string, requirementIds: string[]): Promise<MagicLinkResponse> => {
    const response = await api.post<MagicLinkResponse>('/magic-links/', {
        student: studentId,
        requirements: requirementIds
    });
    return response.data;
};
export interface MagicLinkValidationResponse {
    student_name: string;
    agency_name?: string;
    requirements: {
        id: string;
        description: string;
        is_completed: boolean;
    }[];
    expires_at?: string;
}

export const validateToken = async (token: string): Promise<MagicLinkValidationResponse> => {
    try {
        const response = await api.get<MagicLinkValidationResponse>(`/magic-links/public/${token}/`);
        return response.data;
    } catch (error) {
        console.error('Magic link validation failed', error);
        throw error;
    }
};

export const uploadFileViaMagicLink = async (token: string, file: File, requirementId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirement_id', requirementId);

    // In real implementation, this might go to a specific public upload endpoint
    await api.post(`/magic-links/public/${token}/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return true;
};

export default {
    createMagicLink,
    validateToken,
    uploadFileViaMagicLink,
};
