import api from './api';

export interface PortalStudent {
    id: string;
    student_code: string;
    full_name: string;
    email: string;
    status: string;
    status_display: string;
    counselor_details?: {
        full_name: string;
        email: string;
        role_display: string;
        profile_photo?: string;
    } | null;
}

export interface PortalSessionResponse {
    session_token: string;
    expires_at: string;
    student: PortalStudent;
}

export interface PortalApplication {
    id: string;
    university_name: string;
    course_name: string;
    country_name?: string;
    status: string;
    status_display: string;
    created_at: string;
}

export interface PortalVisaCase {
    id: string;
    status: string;
    status_display: string;
    created_at: string;
}

export interface PortalDocument {
    id: string;
    file_name: string;
    file_size: number;
    file: string;
    status: string;
    status_display: string;
    document_type_display: string;
    is_verified: boolean;
    created_at: string;
}

export interface PortalPayment {
    id: string;
    amount: string;
    status: string;
    status_display: string;
    transaction_type_display: string;
    method_display: string;
    created_at: string;
}

export interface PortalNotification {
    id: string;
    title: string;
    message: string;
    category: 'INFO' | 'ACTION' | 'PAYMENT' | 'DOCUMENT';
    read_at: string | null;
    created_at: string;
}

export interface PortalMeResponse {
    student: PortalStudent;
    applications: PortalApplication[];
    visa_cases: PortalVisaCase[];
    documents: PortalDocument[];
    payments: PortalPayment[];
    notifications: PortalNotification[];
}

const getPortalToken = () => localStorage.getItem('portal_session_token');

export const portalLogin = async (invite_token: string): Promise<PortalSessionResponse> => {
    const response = await api.post('/portal/auth/login/', { invite_token });
    localStorage.setItem('portal_session_token', response.data.session_token);
    return response.data;
};

export const portalLogout = async () => {
    try {
        const token = getPortalToken();
        if (token) {
            await api.post('/portal/auth/logout/', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    } finally {
        localStorage.removeItem('portal_session_token');
    }
};

export const getPortalMe = async (): Promise<PortalMeResponse> => {
    const token = getPortalToken();
    const response = await api.get('/portal/me/', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const uploadPortalDocument = async (formData: FormData) => {
    const token = getPortalToken();
    const response = await api.post('/portal/me/upload-document/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const isPortalAuthenticated = () => !!getPortalToken();
