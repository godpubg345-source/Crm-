import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import MagicUpload from './pages/public/MagicUpload';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Applications from './pages/Applications';
import FinanceDashboard from './pages/FinanceDashboard';
import AuditLogs from './pages/AuditLogs';
import Communications from './pages/Communications';
import BranchDashboard from './pages/BranchDashboard';
import BranchCommandCenter from './pages/BranchCommandCenter';
import BranchLeaderboard from './pages/BranchLeaderboard';
import ResourceLibrary from './pages/Resources';
import VisaPortal from './pages/VisaPortal';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Booking from './pages/public/Booking';
import EmployeeArena from './pages/EmployeeArena';
import StaffManagement from './pages/StaffManagement';
import UniversityPartner from './pages/UniversityPartner';
import Tasks from './pages/Tasks';
import MarketingDashboard from './pages/Marketing';
import CampaignList from './pages/Marketing/CampaignList';
import CampaignBuilder from './pages/Marketing/CampaignBuilder';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import AutomationCenter from './pages/AutomationCenter';
import ComplianceDashboard from './pages/ComplianceDashboard';
import GovernancePanel from './pages/GovernancePanel';
import OperationsHub from './pages/OperationsHub';
import MessagingCenter from './pages/MessagingCenter';
import DocumentReviews from './pages/DocumentReviews';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/magic-upload/:token" element={<MagicUpload />} />
          <Route path="/booking/:counselorId" element={<Booking />} />

          {/* Protected routes with layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="partners" element={<UniversityPartner />} />
            <Route path="applications" element={<Applications />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="finance" element={<FinanceDashboard />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="arena" element={<EmployeeArena />} />
            <Route path="marketing" element={<MarketingDashboard />} />
            <Route path="marketing/campaigns" element={<CampaignList />} />
            <Route path="marketing/campaigns/new" element={<CampaignBuilder />} />
            <Route path="communications" element={<Communications />} />
            <Route path="branches" element={<BranchDashboard />} />
            <Route path="branches/:id" element={<BranchCommandCenter />} />
            <Route path="branches/leaderboard" element={<BranchLeaderboard />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="resources" element={<ResourceLibrary />} />
            <Route path="visas" element={<VisaPortal />} />
            <Route path="predictive-analytics" element={<AnalyticsDashboard />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="automation" element={<AutomationCenter />} />
            <Route path="compliance" element={<ComplianceDashboard />} />
            <Route path="governance" element={<GovernancePanel />} />
            <Route path="operations" element={<OperationsHub />} />
            <Route path="messaging" element={<MessagingCenter />} />
            <Route path="document-reviews" element={<DocumentReviews />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

