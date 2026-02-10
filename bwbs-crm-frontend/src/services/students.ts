import api from './api';

// ============================================================================
// STUDENTS SERVICE - BWBS Education CRM
// ============================================================================

export type StudentSource = 'WALK_IN' | 'WEBSITE' | 'FACEBOOK' | 'REFERRAL' | 'EVENT' | 'OTHER';

export interface Student {
    id: string;
    student_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    passport_number: string;
    nationality: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'ENROLLED' | 'WITHDRAWN';
    source?: StudentSource;
    profile_completeness: number;
    branch: string | null;
    branch_details?: {
        id: string;
        name: string;
        code: string;
        country?: string;
    };
    counselor: string | null;
    counselor_details?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface StudentCreateData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    passport_number?: string;
    nationality?: string;
    date_of_birth?: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// ============================================================================
// GET STUDENTS - Fetch paginated list
// ============================================================================
export const getStudents = async (page = 1, search = ''): Promise<PaginatedResponse<Student>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    // Ensure trailing slash and params
    const response = await api.get<PaginatedResponse<Student>>(`/students/?${params.toString()}`);
    return response.data;
};

// ============================================================================
// GET STUDENT BY ID
// ============================================================================
export const getStudentById = async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}/`);
    return response.data;
};

// ============================================================================
// CREATE STUDENT
// ============================================================================
export const createStudent = async (data: StudentCreateData): Promise<Student> => {
    const response = await api.post<Student>('/students/', data);
    return response.data;
};

// ============================================================================
// UPDATE STUDENT
// ============================================================================
export const updateStudent = async (id: string, data: Partial<StudentCreateData>): Promise<Student> => {
    const response = await api.patch<Student>(`/students/${id}/`, data);
    return response.data;
};

// ============================================================================
// DELETE STUDENT
// ============================================================================
export const deleteStudent = async (id: string): Promise<void> => {
    await api.delete(`/students/${id}/`);
};

export default {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};
