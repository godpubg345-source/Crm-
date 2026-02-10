import api from './api';

export interface Resource {
    id: string;
    title: string;
    description: string;
    file: string | null;
    file_url?: string | null;
    link: string | null;
    category: 'TRAINING' | 'MARKETING' | 'VISA_GUIDE' | 'UNIVERSITY' | 'POLICY' | 'OTHER';
    uploaded_by: {
        id: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export const getResources = async (category?: string): Promise<Resource[]> => {
    const query = category ? `?category=${category}` : '';
    const response = await api.get<PaginatedResponse<Resource> | Resource[]>(`/resources/${query}`);
    // Handle pagination if present, or array
    const data = response.data;
    if ('results' in data) {
        return data.results;
    }
    return data;
};

export const createResource = async (formData: FormData): Promise<Resource> => {
    const response = await api.post('/resources/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteResource = async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}/`);
};
