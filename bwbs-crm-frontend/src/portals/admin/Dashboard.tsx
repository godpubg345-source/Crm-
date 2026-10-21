import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboard';
import type { DashboardResponse } from '../../services/dashboard';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { RecentApplications } from '../../components/dashboard/RecentApplications';
import { TaskWidget } from '../../components/dashboard/TaskWidget';
import { PipelineFunnel } from '../../components/dashboard/PipelineFunnel';
import { ActivityFeedWidget } from '../../components/dashboard/ActivityFeedWidget';
import { VisaAlertsWidget } from '../../components/dashboard/VisaAlertsWidget';
import { ENABLE_IMMIGRATION } from '../../config/features';

import {
    Users,
    FileText,
    Wallet,
    BadgeDollarSign,
    TrendingUp,
    CheckSquare,
    UserPlus,
    type LucideIcon,
} from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    hint: string;
    icon: LucideIcon;
    to?: string;
}

const KpiCard = ({ title, value, hint, icon: Icon, to }: KpiCardProps) => {
    const body = (
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-full transition-colors hover:border-slate-300">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
    );
    return to ? <Link to={to} className="block">{body}</Link> : body;
};

const Dashboard = () => {
    const { data, isLoading } = useQuery<DashboardResponse>({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000,
    });

    const user = data?.user;
    const stats = data?.stats;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-16 w-72 bg-slate-200/60 rounded-xl" />
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-200/60 rounded-xl" />
                    ))}
                </div>
                <div className="h-72 bg-slate-200/60 rounded-xl" />
            </div>
        );
    }

    const revenueTrend = data?.analytics?.revenue_trend ?? [];

    return (
        <div className="space-y-6 pb-12">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        Welcome back, {user?.first_name || 'Admin'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {user?.branch?.name ? ` · ${user.branch.name}` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/admin/dashboard/tasks"
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        {stats?.pending_tasks || 0} pending tasks
                    </Link>
                    <Link
                        to="/admin/leads"
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700"
                    >
                        <UserPlus className="w-4 h-4" />
                        View leads
                    </Link>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                    title="Students"
                    value={(stats?.total_students || 0).toLocaleString()}
                    hint={`${stats?.new_leads_today || 0} new leads today`}
                    icon={Users}
                    to="/admin/students"
                />
                <KpiCard
                    title="Applications"
                    value={(stats?.total_applications || 0).toLocaleString()}
                    hint="All applications"
                    icon={FileText}
                    to="/admin/applications"
                />
                <KpiCard
                    title="Offers awaiting deposit"
                    value={(stats?.offers_pending_deposit || 0).toLocaleString()}
                    hint="Needs follow-up"
                    icon={Wallet}
                    to="/admin/applications"
                />
                <KpiCard
                    title="Revenue"
                    value={`£${(stats?.total_revenue || 0).toLocaleString()}`}
                    hint="Paid to date"
                    icon={BadgeDollarSign}
                    to="/admin/finance"
                />
            </div>

            {/* Pipeline + tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                    <PipelineFunnel stats={data?.pipeline_stats || []} />
                </div>
                <div className="lg:col-span-4">
                    <TaskWidget tasks={data?.recent_tasks || []} />
                </div>
            </div>

            {/* Revenue + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-slate-900">Revenue</h3>
                        <p className="text-sm text-slate-500">Paid revenue, last 6 months</p>
                    </div>

                    <div className="h-[260px] w-full">
                        {revenueTrend.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                                <TrendingUp className="w-6 h-6" />
                                <p className="text-sm">No paid revenue recorded yet.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `£${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        formatter={(value) => [`£${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {ENABLE_IMMIGRATION && <VisaAlertsWidget alerts={data?.visa_alerts || []} />}
                    <ActivityFeedWidget activities={data?.recent_activities || []} />
                </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <RecentApplications />
            </div>
        </div>
    );
};

export default Dashboard;
