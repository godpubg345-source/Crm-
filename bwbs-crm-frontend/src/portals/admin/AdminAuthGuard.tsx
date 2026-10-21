import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, fetchCurrentUser } from '../../services/auth';
import { getAccessToken } from '../../services/authStore';
import { ADMIN_ROLES, hasRole, homePathForRole } from '../../config/roles';

interface AdminAuthGuardProps {
    children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
    const location = useLocation();
    const [isAuth, setIsAuth] = useState(isAuthenticated());
    const [user, setUser] = useState(getCurrentUser());
    const [loading, setLoading] = useState(!isAuth && !!getAccessToken());

    useEffect(() => {
        const bootstrap = async () => {
            // Token exists in localStorage but user data is missing (page refresh scenario)
            if (getAccessToken() && !getCurrentUser()) {
                try {
                    const userData = await fetchCurrentUser();
                    setUser(userData);
                    setIsAuth(true);
                } catch {
                    setIsAuth(false);
                }
            } else if (getAccessToken()) {
                setIsAuth(true);
                setUser(getCurrentUser());
            }
            setLoading(false);
        };
        bootstrap();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] animate-pulse" />
                    <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user) {
        // Roles without admin access go to their own portal (CEO → /ceo, staff → employee portal)
        if (!hasRole(user.role, ADMIN_ROLES)) {
            return <Navigate to={homePathForRole(user.role)} replace />;
        }
    }

    return <>{children}</>;
};

export default AdminAuthGuard;

