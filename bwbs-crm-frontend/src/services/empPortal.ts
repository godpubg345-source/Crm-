import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import { setAccessToken, getAccessToken, clearAuth } from './authStore';
import { login } from './auth';
import { 
    type AttendanceLog, type LeaveRequest, 
    type Student, type Application, type Lead, type User
} from '../types';

// ============================================================================
// Employee Portal Auth helpers (Mapping for backward compatibility if needed)
// ============================================================================
export const getEmpPortalToken = () => getAccessToken();
export const empPortalLogout = () => clearAuth();
export const isEmpPortalAuthenticated = () => !!getAccessToken();

export const empPortalLogin = async (credentials: { email?: string; username?: string; password: string }) => {
    const email = credentials.email || credentials.username || '';
    return await login(email, credentials.password);
};

// ============================================================================
// Employee Portal API Functions (use centralized api instance)
// ============================================================================

export const empGetMyProfile = async (): Promise<User> => {
    const response = await api.get(API_ENDPOINTS.USERS.ME);
    return response.data;
};

export const empGetPerformance = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.PERFORMANCE);
    return response.data;
};

export const empGetAttendanceLogs = async (branchId?: string, userId?: string): Promise<AttendanceLog[]> => {
    const response = await api.get(API_ENDPOINTS.ATTENDANCE.LIST, {
        params: { branch: branchId, user: userId }
    });
    return response.data?.results || response.data;
};

export const empClockIn = async (branchId: string, notes?: string) => {
    const response = await api.post(API_ENDPOINTS.ATTENDANCE.LIST, {
        branch: branchId,
        date: new Date().toISOString().split('T')[0],
        clock_in: new Date().toISOString(),
        notes
    });
    return response.data;
};

export const empClockOut = async (logId: string) => {
    const response = await api.patch(API_ENDPOINTS.ATTENDANCE.DETAIL(logId), {
        clock_out: new Date().toISOString()
    });
    return response.data;
};

export const empGetLeaveRequests = async (branchId?: string, userId?: string): Promise<LeaveRequest[]> => {
    const response = await api.get(API_ENDPOINTS.LEAVE_REQUESTS.LIST, {
        params: { branch: branchId, user: userId }
    });
    return response.data?.results || response.data;
};

export const empCreateLeaveRequest = async (data: {
    branch: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
}) => {
    const response = await api.post(API_ENDPOINTS.LEAVE_REQUESTS.LIST, data);
    return response.data;
};

export const empGetPayrollReport = async (userId: string, months: number = 6) => {
    const response = await api.get(API_ENDPOINTS.USERS.PAYROLL_REPORT(userId), {
        params: { months }
    });
    return response.data;
};

// ============================================================================
// My Work API Functions
// ============================================================================

export const empGetMyStudents = async (): Promise<Student[]> => {
    const response = await api.get(API_ENDPOINTS.STUDENTS.LIST, {
        params: { assigned_to: 'me' }
    });
    return response.data?.results || response.data || [];
};

export const empGetMyApplications = async (): Promise<Application[]> => {
    const response = await api.get(API_ENDPOINTS.APPLICATIONS.LIST);
    return response.data?.results || response.data || [];
};

export const empGetStudent = async (studentId: string): Promise<Student> => {
    const response = await api.get(API_ENDPOINTS.STUDENTS.DETAIL(studentId));
    return response.data;
};

export const empCreateApplication = async (data: any) => {
    const response = await api.post(API_ENDPOINTS.APPLICATIONS.LIST, data);
    return response.data;
};

export const empUpdateApplication = async (appId: string, data: any) => {
    const response = await api.patch(API_ENDPOINTS.APPLICATIONS.DETAIL(appId), data);
    return response.data;
};

export const empGetMyTasks = async () => {
    const response = await api.get(API_ENDPOINTS.TASKS.LIST);
    return response.data?.results || response.data || [];
};

export const empCreateTask = async (data: any) => {
    const response = await api.post(API_ENDPOINTS.TASKS.LIST, data);
    return response.data;
};

export const empUpdateTask = async (taskId: string, data: any) => {
    const response = await api.patch(API_ENDPOINTS.TASKS.DETAIL(taskId), data);
    return response.data;
};

export const empGetMyLeads = async (): Promise<Lead[]> => {
    const response = await api.get(API_ENDPOINTS.LEADS.LIST);
    return response.data?.results || response.data || [];
};

export const empUpdateLead = async (leadId: string, data: any) => {
    const response = await api.patch(API_ENDPOINTS.LEADS.DETAIL(leadId), data);
    return response.data;
};

export const empArchiveLead = async (leadId: string, archive_reason: string) => {
    const response = await api.post(API_ENDPOINTS.LEADS.ARCHIVE(leadId), { archive_reason });
    return response.data;
};

export const empConvertToStudent = async (leadId: string) => {
    const response = await api.post(API_ENDPOINTS.LEADS.CONVERT(leadId));
    return response.data;
};

export const empGetMyVisaCases = async () => {
    const response = await api.get(API_ENDPOINTS.VISAS.CASES, {
        params: { assigned_to: 'me' }
    });
    return response.data?.results || response.data || [];
};

export const empGetLeaderboard = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.LEADERBOARD);
    return response.data?.results || response.data || [];
};

// Messaging — backend has no thread system; real endpoints are /messaging/logs/
// (MessageLog: recipient, subject, body, status) and /messaging/templates/.
export const empGetMessages = async () => {
    const response = await api.get(API_ENDPOINTS.MESSAGING.LOGS);
    return response.data?.results || response.data || [];
};

export const empSendMessage = async (data: { thread?: string; recipient?: string; subject?: string; body: string }) => {
    // FIX: was POST '/messaging/messages/' (404, no such route) — now logs a message
    // via MessageLog (requires channel + recipient)
    const response = await api.post(API_ENDPOINTS.MESSAGING.LOGS, {
        channel: 'EMAIL',
        recipient: data.recipient || 'unspecified',
        subject: data.subject || '',
        body: data.body,
    });
    return response.data;
};

export const empGetThreadMessages = async (threadId: string) => {
    // FIX: was GET '/messaging/threads/${threadId}/messages/' (404) — no threads exist;
    // returning filtered message logs instead
    const response = await api.get(`${API_ENDPOINTS.MESSAGING.LOGS}?search=${encodeURIComponent(threadId)}`);
    return response.data?.results || response.data || [];
};

export default api;

