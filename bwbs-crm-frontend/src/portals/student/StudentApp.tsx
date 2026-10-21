import { Routes, Route, Navigate } from 'react-router-dom';
import PortalAuthGuard from './PortalAuthGuard';
import PortalLayout from './PortalLayout';
import PortalDashboard from './PortalDashboard';
import PortalApplications from './PortalApplications';
import PortalDocuments from './PortalDocuments';
import PortalPayments from './PortalPayments';
import PortalNotifications from './PortalNotifications';
import PortalVisa from './PortalVisa';

const StudentApp = () => {
    return (
        <Routes>
            <Route element={
                <PortalAuthGuard>
                    <PortalLayout />
                </PortalAuthGuard>
            }>
                <Route index element={<PortalDashboard />} />
                <Route path="applications" element={<PortalApplications />} />
                <Route path="documents" element={<PortalDocuments />} />
                <Route path="payments" element={<PortalPayments />} />
                <Route path="notifications" element={<PortalNotifications />} />
                <Route path="visa" element={<PortalVisa />} />
                <Route path="*" element={<Navigate to="" replace />} />
            </Route>
        </Routes>
    );
};

export default StudentApp;
