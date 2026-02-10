import api from './api';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskCategory = 'DOCUMENTATION' | 'FINANCE' | 'ADMISSION' | 'VISA_PREP' | 'POST_ARRIVAL' | 'OTHER';

export interface TaskCreateData {
    student?: string;
    application?: string;
    title: string;
    description?: string;
    due_date?: string;
    priority: TaskPriority;
    category?: TaskCategory;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    assigned_to: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    created_by: {
        id: string;
        first_name: string;
        last_name: string;
    };
    student?: {
        id: string;
        name: string;
        student_code: string;
    };
    application?: {
        id: string;
    };
    due_date: string; // ISO date string
    priority: TaskPriority;
    status: TaskStatus;
    category: TaskCategory;
    completed_at?: string;
    created_at: string;
}

export const getTasks = async (params?: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    student?: string;
    application?: string;
    category?: string;
}): Promise<{ results: Task[] }> => {
    // Handling query params
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.assigned_to) query.append('assigned_to', params.assigned_to);
    if (params?.student) query.append('student', params.student);
    if (params?.application) query.append('application', params.application);
    if (params?.category) query.append('category', params.category);

    const response = await api.get(`/tasks/?${query.toString()}`);
    return response.data;
};

export const createTask = async (data: TaskCreateData): Promise<Task> => {
    const response = await api.post('/tasks/', data);
    return response.data;
};

export const updateTask = async (id: string, data: Partial<TaskCreateData>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}/`);
};

export const priorityColors = {
    URGENT: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
};
