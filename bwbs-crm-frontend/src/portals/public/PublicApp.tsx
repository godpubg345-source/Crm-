import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import PortalLogin from './PortalLogin';
import EmpLogin from './EmpLogin';
import MagicUpload from './MagicUpload';
import Booking from './Booking';

const PublicApp = () => {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="portal/login" element={<PortalLogin />} />
            <Route path="employee-portal/login" element={<EmpLogin />} />
            <Route path="magic-upload/:token" element={<MagicUpload />} />
            <Route path="booking/:counselorId" element={<Booking />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default PublicApp;
