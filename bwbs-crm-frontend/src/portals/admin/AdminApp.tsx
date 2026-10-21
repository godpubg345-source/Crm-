import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import AdminAuthGuard from './AdminAuthGuard';
import DashboardLayout from './DashboardLayout';
import HubLayout, { type HubTab, PageLoader } from '../../components/layout/HubLayout';
import { ENABLE_IMMIGRATION } from '../../config/features';

// Pages load on demand so the admin bundle stays small
const DashboardHome = lazy(() => import('./Dashboard'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const Tasks = lazy(() => import('./Tasks'));
const Leads = lazy(() => import('./Leads'));
const LeadDetail = lazy(() => import('./LeadDetail'));
const MarketingDashboard = lazy(() => import('./Marketing'));
const CampaignList = lazy(() => import('./Marketing/CampaignList'));
const CampaignBuilder = lazy(() => import('./Marketing/CampaignBuilder'));
const LeadImporter = lazy(() => import('./Marketing/LeadImporter'));
const Students = lazy(() => import('./Students'));
const StudentDetail = lazy(() => import('./StudentDetail'));
const DocumentReviews = lazy(() => import('./DocumentReviews'));
const AppointmentsPage = lazy(() => import('./AppointmentsPage'));
const Communications = lazy(() => import('./Communications'));
const Applications = lazy(() => import('./Applications'));
const VisaPortal = lazy(() => import('./VisaPortal'));
const VisaComplianceDashboard = lazy(() => import('./VisaComplianceDashboard'));
const ComplianceDashboard = lazy(() => import('./ComplianceDashboard'));
const UniversityPartner = lazy(() => import('./UniversityPartner'));
const FinanceDashboard = lazy(() => import('./FinanceDashboard'));
const CommissionKanban = lazy(() => import('./CommissionKanban'));
const HRManagement = lazy(() => import('./HRManagement'));
const StaffDossierPage = lazy(() => import('./StaffDossierPage'));
const BranchDashboard = lazy(() => import('./BranchDashboard'));
const BranchCommandCenter = lazy(() => import('./BranchCommandCenter'));
const Leaderboard = lazy(() => import('./Leaderboard'));
const BranchLeaderboard = lazy(() => import('./BranchLeaderboard'));
const OperationsHub = lazy(() => import('./OperationsHub'));
const Settings = lazy(() => import('./Settings'));
const AutomationCenter = lazy(() => import('./AutomationCenter'));
const GovernancePanel = lazy(() => import('./GovernancePanel'));
const AuditLogs = lazy(() => import('./AuditLogs'));
const ResourceLibrary = lazy(() => import('./Resources'));
const MessagingCenter = lazy(() => import('./MessagingCenter'));

// ─── Hub tab definitions (one sidebar entry each) ───────────────────────────

const DASHBOARD_TABS: HubTab[] = [
    { label: 'Overview', to: '/admin/dashboard', end: true },
    { label: 'Reports', to: '/admin/dashboard/reports' },
    { label: 'Tasks', to: '/admin/dashboard/tasks' },
];

const LEADS_TABS: HubTab[] = [
    { label: 'All Leads', to: '/admin/leads', end: true },
    { label: 'Campaigns', to: '/admin/leads/campaigns' },
    { label: 'Import', to: '/admin/leads/import' },
    { label: 'Marketing Stats', to: '/admin/leads/marketing' },
];

const STUDENTS_TABS: HubTab[] = [
    { label: 'All Students', to: '/admin/students', end: true },
    { label: 'Document Reviews', to: '/admin/students/reviews' },
    { label: 'Appointments', to: '/admin/students/appointments' },
    { label: 'Communication Log', to: '/admin/students/communications' },
];

const APPLICATIONS_TABS: HubTab[] = [
    { label: 'Applications', to: '/admin/applications', end: true },
    ...(ENABLE_IMMIGRATION ? [
        { label: 'Visa Cases', to: '/admin/applications/visas' },
        { label: 'Visa Reports', to: '/admin/applications/visa-reports' },
        { label: 'Visa Rules', to: '/admin/applications/compliance' },
    ] : []),
];

const FINANCE_TABS: HubTab[] = [
    { label: 'Overview', to: '/admin/finance', end: true },
    { label: 'Commissions', to: '/admin/finance/commissions' },
];

const TEAM_TABS: HubTab[] = [
    { label: 'Staff', to: '/admin/team', end: true },
    { label: 'Branches', to: '/admin/team/branches', end: true },
    { label: 'Staff Leaderboard', to: '/admin/team/leaderboard' },
    { label: 'Branch Leaderboard', to: '/admin/team/branch-leaderboard' },
];

const SETTINGS_TABS: HubTab[] = [
    { label: 'Profile', to: '/admin/settings', end: true },
    { label: 'Automation', to: '/admin/settings/automation' },
    { label: 'Message Templates', to: '/admin/settings/templates' },
    { label: 'Data & Privacy', to: '/admin/settings/privacy' },
    { label: 'Audit Logs', to: '/admin/settings/audit-logs' },
    { label: 'Resources', to: '/admin/settings/resources' },
];

// ─── Old URL → new URL (keeps bookmarks and saved links working) ────────────

const LEGACY_REDIRECTS: Record<string, string> = {
    'tasks': '/admin/dashboard/tasks',
    'analytics': '/admin/dashboard/reports',
    'predictive-analytics': '/admin/dashboard/reports',
    'marketing': '/admin/leads/marketing',
    'marketing/campaigns': '/admin/leads/campaigns',
    'marketing/campaigns/new': '/admin/leads/campaigns/new',
    'marketing/leads/import': '/admin/leads/import',
    'reviews': '/admin/students/reviews',
    'appointments': '/admin/students/appointments',
    'communications': '/admin/students/communications',
    'visas': '/admin/applications/visas',
    'visas/analytics': '/admin/applications/visa-reports',
    'compliance': '/admin/applications/compliance',
    'partners': '/admin/universities',
    'finance/kanban': '/admin/finance/commissions',
    'hr': '/admin/team',
    'branches': '/admin/team/branches',
    'branches/leaderboard': '/admin/team/branch-leaderboard',
    'leaderboard': '/admin/team/leaderboard',
    'operations': '/admin/agents',
    'governance': '/admin/settings/privacy',
    'automation': '/admin/settings/automation',
    'audit-logs': '/admin/settings/audit-logs',
    'resources': '/admin/settings/resources',
    'messaging': '/admin/settings/templates',
};

/** Redirect that carries the :id param, e.g. /admin/hr/staff/42 → /admin/team/staff/42 */
const RedirectWithId = ({ to }: { to: (id: string) => string }) => {
    const { id = '' } = useParams();
    return <Navigate to={to(id)} replace />;
};

const AdminApp = () => {
    return (
        <Routes>
            <Route element={
                <AdminAuthGuard>
                    <DashboardLayout />
                </AdminAuthGuard>
            }>
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* Suspense inside the layout so the sidebar stays put while a page loads */}
                <Route element={<Suspense fallback={<PageLoader />}><Outlet /></Suspense>}>

                    <Route path="dashboard" element={<HubLayout tabs={DASHBOARD_TABS} />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="reports" element={<AnalyticsDashboard />} />
                        <Route path="tasks" element={<Tasks />} />
                    </Route>

                    <Route path="leads" element={<HubLayout tabs={LEADS_TABS} />}>
                        <Route index element={<Leads />} />
                        <Route path="campaigns" element={<CampaignList />} />
                        <Route path="campaigns/new" element={<CampaignBuilder />} />
                        <Route path="import" element={<LeadImporter />} />
                        <Route path="marketing" element={<MarketingDashboard />} />
                    </Route>
                    <Route path="leads/:id" element={<LeadDetail />} />

                    <Route path="students" element={<HubLayout tabs={STUDENTS_TABS} />}>
                        <Route index element={<Students />} />
                        <Route path="reviews" element={<DocumentReviews />} />
                        <Route path="appointments" element={<AppointmentsPage />} />
                        <Route path="communications" element={<Communications />} />
                    </Route>
                    <Route path="students/:id" element={<StudentDetail />} />

                    <Route path="applications" element={<HubLayout tabs={APPLICATIONS_TABS} />}>
                        <Route index element={<Applications />} />
                        {ENABLE_IMMIGRATION && (
                            <>
                                <Route path="visas" element={<VisaPortal />} />
                                <Route path="visa-reports" element={<VisaComplianceDashboard />} />
                                <Route path="compliance" element={<ComplianceDashboard />} />
                            </>
                        )}
                    </Route>

                    <Route path="universities" element={<UniversityPartner />} />

                    <Route path="finance" element={<HubLayout tabs={FINANCE_TABS} />}>
                        <Route index element={<FinanceDashboard />} />
                        <Route path="commissions" element={<CommissionKanban />} />
                    </Route>

                    <Route path="team" element={<HubLayout tabs={TEAM_TABS} />}>
                        <Route index element={<HRManagement />} />
                        <Route path="branches" element={<BranchDashboard />} />
                        <Route path="leaderboard" element={<Leaderboard />} />
                        <Route path="branch-leaderboard" element={<BranchLeaderboard />} />
                    </Route>
                    <Route path="team/staff/:id" element={<StaffDossierPage />} />
                    <Route path="team/branches/:id" element={<BranchCommandCenter />} />

                    <Route path="agents" element={<OperationsHub />} />

                    <Route path="settings" element={<HubLayout tabs={SETTINGS_TABS} />}>
                        <Route index element={<Settings />} />
                        <Route path="automation" element={<AutomationCenter />} />
                        <Route path="templates" element={<MessagingCenter />} />
                        <Route path="privacy" element={<GovernancePanel />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                        <Route path="resources" element={<ResourceLibrary />} />
                    </Route>
                </Route>

                {/* Legacy URLs */}
                {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
                    <Route key={from} path={from} element={<Navigate to={to} replace />} />
                ))}
                <Route path="hr/staff/:id" element={<RedirectWithId to={(id) => `/admin/team/staff/${id}`} />} />
                <Route path="branches/:id" element={<RedirectWithId to={(id) => `/admin/team/branches/${id}`} />} />

                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default AdminApp;
