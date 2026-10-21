import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isEmpPortalAuthenticated } from '../../services/empPortal';

interface EmpPortalAuthGuardProps {
    children: React.ReactNode;
}

const EmpPortalAuthGuard: React.FC<EmpPortalAuthGuardProps> = ({ children }) => {
    const location = useLocation();
    const authenticated = isEmpPortalAuthenticated();

    if (!authenticated) {
        return <Navigate to="/employee-portal/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default EmpPortalAuthGuard;
