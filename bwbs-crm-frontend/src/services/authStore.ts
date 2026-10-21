import { type User } from '../types/user';

// ============================================================================
// AUTH STORAGE - Global Session State
// ============================================================================

const USER_STORAGE_KEY = 'bwbs_user';
const TOKEN_KEY = 'bwbs_access_token';

let currentUser: User | null = null;

export const setAccessToken = (token: string | null) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setUser = (user: User | null) => {
    currentUser = user;
    if (user) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        sessionStorage.removeItem(USER_STORAGE_KEY);
    }
};

export const getUser = (): User | null => {
    if (currentUser) return currentUser;
    const userStr = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;

    try {
        currentUser = JSON.parse(userStr) as User;
        return currentUser;
    } catch {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    currentUser = null;
    sessionStorage.removeItem(USER_STORAGE_KEY);
};


