export type StoredUser = {
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
};

const USER_STORAGE_KEY = 'bwbs_user';

let accessToken: string | null = null;
let currentUser: StoredUser | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setUser = (user: StoredUser | null) => {
    currentUser = user;
    if (user) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        sessionStorage.removeItem(USER_STORAGE_KEY);
    }
};

export const getUser = (): StoredUser | null => {
    if (currentUser) return currentUser;
    const userStr = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;

    try {
        currentUser = JSON.parse(userStr) as StoredUser;
        return currentUser;
    } catch {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const clearAuth = () => {
    accessToken = null;
    currentUser = null;
    sessionStorage.removeItem(USER_STORAGE_KEY);
};
