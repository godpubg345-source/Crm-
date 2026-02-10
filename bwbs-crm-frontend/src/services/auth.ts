import api, { API_BASE_URL } from './api';
import axios from 'axios';
import { getAccessToken, setAccessToken, setUser, getUser, clearAuth, type StoredUser } from './authStore';

// ============================================================================
// AUTH SERVICE - BWBS Education CRM
// ============================================================================

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_superuser?: boolean;
    branch?: string;
    branch_details?: {
        id: string;
        name: string;
        code: string;
        country?: string;
    };
}

export interface Branch {
    id: string;
    name: string;
    code: string;
    country?: string;
}

// SimpleJWT returns { access } and sets refresh in httpOnly cookie
interface LoginResponse {
    access: string;
}

const canSwitchBranchRole = (role?: string) =>
    role === 'SUPER_ADMIN' || role === 'AUDITOR' || role === 'COUNTRY_MANAGER';

const fetchCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>('/users/me/');
    setUser(response.data as StoredUser);
    return response.data;
};

// ============================================================================
// LOGIN - Authenticate user and store tokens
// ============================================================================
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login/', {
            email,
            password,
        });

        const { access } = response.data;

        // Store access token in memory (refresh is stored in httpOnly cookie)
        setAccessToken(access);
        api.defaults.headers.common.Authorization = `Bearer ${access}`;

        try {
            const user = await fetchCurrentUser();
            if (!canSwitchBranchRole(user?.role)) {
                localStorage.removeItem('branch_id');
            }
        } catch {
            // Ignore user fetch errors; auth tokens are already stored
        }

        return response.data;
    } catch (error: unknown) {
        // Re-throw with a user-friendly message
        const axiosError = error as { response?: { status: number, data?: { detail?: string } } };
        if (axiosError.response?.status === 401) {
            throw new Error('Invalid email or password');
        }
        if (axiosError.response?.status === 400) {
            throw new Error(axiosError.response.data?.detail || 'Invalid credentials');
        }
        throw new Error('Login failed. Please try again.');
    }
};

// ============================================================================
// LOGOUT - Clear all auth data
// ============================================================================
export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout/', {});
    } catch {
        // Ignore logout errors; proceed to clear local state
    } finally {
        clearAuth();
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem('branch_id');
        window.location.href = '/login';
    }
};

// ============================================================================
// GET CURRENT USER - Retrieve stored user data
// ============================================================================
export const getCurrentUser = (): User | null => {
    return getUser() as User | null;
};

// ============================================================================
// IS AUTHENTICATED - Check if user is logged in
// ============================================================================
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

// ============================================================================
// REFRESH TOKEN - Get new access token using refresh token
// ============================================================================
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const response = await axios.post<{ access: string }>(
            `${API_BASE_URL}/auth/refresh/`,
            {},
            { withCredentials: true }
        );

        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        return newAccessToken;
    } catch {
        // Refresh failed - force logout
        await logout();
        return null;
    }
};

// ============================================================================
// GET BRANCHES - Fetch available branches for the user
// ============================================================================
export const getBranches = async (): Promise<Branch[]> => {
    try {
        const response = await api.get<{ results?: Branch[] }>('/branches/');
        // Handle pagination if results key exists
        if (response.data.results) {
            return response.data.results;
        }
        return response.data as unknown as Branch[];
    } catch {
        console.warn('Failed to fetch branches, using fallbacks');
        return [
            { id: '1', name: 'Global / HQ', code: 'HQ' },
            { id: '2', name: 'Dubai', code: 'DXB' },
            { id: '3', name: 'London', code: 'LHR' },
            { id: '4', name: 'Dhaka', code: 'DAC' },
        ];
    }
};

// ============================================================================
// UPDATE PROFILE - Update current user details
// ============================================================================
export const updateProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/users/me/', data);
    setUser(response.data as StoredUser);
    return response.data;
};

// ============================================================================
// CHANGE PASSWORD - Secure password update
// ============================================================================
export const changePassword = async (data: Record<string, string>): Promise<void> => {
    await api.post('/users/change-password/', data);
};

export default {
    login,
    logout,
    getCurrentUser,
    isAuthenticated,
    refreshAccessToken,
    getBranches,
    updateProfile,
    changePassword,
};

export { fetchCurrentUser };
