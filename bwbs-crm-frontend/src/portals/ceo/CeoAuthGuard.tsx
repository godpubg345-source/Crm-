import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../services/auth';
import { CEO_ROLES, hasRole } from '../../config/roles';

const CeoAuthGuard = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    const user = getCurrentUser();
    if (!user || !hasRole(user.role, CEO_ROLES)) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

export default CeoAuthGuard;
