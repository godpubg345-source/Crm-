import { Routes, Route, Navigate } from 'react-router-dom';
import CeoAuthGuard from './CeoAuthGuard';
import CeoLayout from './CeoLayout';
import CeoDashboard from './CeoDashboard';
import CeoRevenue from './CeoRevenue';
import CeoPerformance from './CeoPerformance';
import CeoBranches from './CeoBranches';
import CeoWorkforce from './CeoWorkforce';
import CeoForecast from './CeoForecast';
import CeoReports from './CeoReports';

const CeoApp = () => {
    return (
        <Routes>
            <Route element={
                <CeoAuthGuard>
                    <CeoLayout />
                </CeoAuthGuard>
            }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CeoDashboard />} />
                <Route path="revenue" element={<CeoRevenue />} />
                <Route path="performance" element={<CeoPerformance />} />
                <Route path="branches" element={<CeoBranches />} />
                <Route path="workforce" element={<CeoWorkforce />} />
                <Route path="forecast" element={<CeoForecast />} />
                <Route path="reports" element={<CeoReports />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default CeoApp;
