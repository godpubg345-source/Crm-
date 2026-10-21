import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isPortalAuthenticated } from '../../services/portal';
import { STUDENT_PREVIEW_ROLES, hasRole } from '../../config/roles';

interface PortalAuthGuardProps {
    children: React.ReactNode;
}


// Read directly from localStorage — works across new tabs
const getStoredToken = () => localStorage.getItem('bwbs_access_token');
const getStoredUser = (): { role: string } | null => {
    try {
        const raw = sessionStorage.getItem('bwbs_user');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
};

const PortalAuthGuard: React.FC<PortalAuthGuardProps> = ({ children }) => {
    const location = useLocation();

    // ✅ Student with invite token — always allow
    if (isPortalAuthenticated()) {
        return <>{children}</>;
    }

    // ✅ Admin staff — allow if token exists in localStorage
    const adminToken = getStoredToken();
    if (adminToken) {
        const user = getStoredUser();
        // If user role is known and is an admin role — allow
        if (!user || hasRole(user.role, STUDENT_PREVIEW_ROLES)) {
            return <>{children}</>;
        }
    }

    // ❌ Not authenticated — redirect to portal login
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
};

export default PortalAuthGuard;
