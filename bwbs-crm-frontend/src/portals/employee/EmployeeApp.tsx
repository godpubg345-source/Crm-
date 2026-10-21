import { Routes, Route } from 'react-router-dom';
import EmpPortalAuthGuard from './EmpPortalAuthGuard';
import EmpPortalLayout from './EmpPortalLayout';
import EmpDashboard from './EmpDashboard';
import EmpAttendance from './EmpAttendance';
import EmpLeaves from './EmpLeaves';
import EmpPayroll from './EmpPayroll';
import EmpStudents from './EmpStudents';
import EmpStudentDetail from './EmpStudentDetail';
import EmpApplications from './EmpApplications';
import EmpTasks from './EmpTasks';
import EmpLeads from './EmpLeads';
import EmpVisaCases from './EmpVisaCases';
import EmpMessages from './EmpMessages';
import EmpLeaderboard from './EmpLeaderboard';
import { ENABLE_IMMIGRATION } from '../../config/features';

const EmployeeApp = () => {
    return (
        <Routes>
            <Route element={
                <EmpPortalAuthGuard>
                    <EmpPortalLayout />
                </EmpPortalAuthGuard>
            }>
                <Route index element={<EmpDashboard />} />
                <Route path="attendance" element={<EmpAttendance />} />
                <Route path="leaves" element={<EmpLeaves />} />
                <Route path="payroll" element={<EmpPayroll />} />
                <Route path="students" element={<EmpStudents />} />
                <Route path="students/:id" element={<EmpStudentDetail />} />
                <Route path="applications" element={<EmpApplications />} />
                <Route path="tasks" element={<EmpTasks />} />
                <Route path="leads" element={<EmpLeads />} />
                {ENABLE_IMMIGRATION && <Route path="visa-cases" element={<EmpVisaCases />} />}
                <Route path="messages" element={<EmpMessages />} />
                <Route path="leaderboard" element={<EmpLeaderboard />} />
            </Route>
        </Routes>
    );
};

export default EmployeeApp;
