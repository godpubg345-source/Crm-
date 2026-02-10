import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/dashboard';
import type { DashboardResponse } from '../services/dashboard';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { StatCard } from '../components/dashboard/StatCard';
import { RecentApplications } from '../components/dashboard/RecentApplications';
import { TaskWidget } from '../components/dashboard/TaskWidget';
import { PipelineFunnel } from '../components/dashboard/PipelineFunnel';
import { ActivityFeedWidget } from '../components/dashboard/ActivityFeedWidget';
import { VisaAlertsWidget } from '../components/dashboard/VisaAlertsWidget';

import {
    Users,
    FileText,
    Plane,
    BadgeDollarSign,
    TrendingUp
} from 'lucide-react';

const REVENUE_DATA = [
    { name: 'Sep', revenue: 45000 },
    { name: 'Oct', revenue: 52000 },
    { name: 'Nov', revenue: 48000 },
    { name: 'Dec', revenue: 61000 },
    { name: 'Jan', revenue: 55000 },
    { name: 'Feb', revenue: 67000 },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const Dashboard = () => {
    const { data, isLoading } = useQuery<DashboardResponse>({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
        refetchInterval: 30000, // Real-time pulse every 30s
    });

    const user = data?.user;
    const stats = data?.stats;

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8 p-1">
                <div className="h-20 w-full bg-slate-50 rounded-[2rem]" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-50 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-6 h-96">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-50 rounded-[2rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Command Header */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                            Command Center
                        </div>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-medium text-slate-500">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                        Welcome back, {user?.first_name}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Overview: <span className="font-semibold text-slate-700">{stats?.pending_tasks || 0} pending tasks</span> and <span className="font-semibold text-slate-700">{stats?.pending_visas || 0} visa cases</span>.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-8 bg-slate-50/50 px-6 py-4 rounded-xl border border-slate-100">
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Branch Node</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-bold text-slate-700">{user?.branch?.name || 'Global HQ'}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Role</span>
                        <span className="text-sm font-bold text-[#AD03DE]">{user?.role_display}</span>
                    </div>
                </div>
            </motion.div>

            {/* Row 1: Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.total_students || 0}
                    icon={Users}
                    trend={`+${stats?.new_leads_today || 0} today`}
                />
                <StatCard
                    title="Active Applications"
                    value={stats?.active_applications || 0}
                    icon={FileText}
                    trend="Healthy Flow"
                />
                <StatCard
                    title="Pending Visas"
                    value={stats?.pending_visas || 0}
                    icon={Plane}
                    trend={(stats?.pending_visas || 0) > 5 ? 'Critical Volume' : 'Stable'}
                />
                <StatCard
                    title="Total Revenue"
                    value={`£${(stats?.total_revenue || 0).toLocaleString()}`}
                    icon={BadgeDollarSign}
                    trend="+12% vs last mo"
                />
            </motion.div>

            {/* Row 2: Operational Intelligence (Bento Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-fr">
                {/* Tasks: 3 cols */}
                <motion.div variants={itemVariants} className="lg:col-span-3">
                    <TaskWidget tasks={data?.recent_tasks || []} />
                </motion.div>

                {/* Pipeline: 5 cols */}
                <motion.div variants={itemVariants} className="lg:col-span-6">
                    <PipelineFunnel stats={data?.pipeline_stats || []} />
                </motion.div>

                {/* Visa Alerts: 4 cols */}
                <motion.div variants={itemVariants} className="lg:col-span-3">
                    <VisaAlertsWidget alerts={data?.visa_alerts || []} />
                </motion.div>
            </div>

            {/* Row 3: Analytics & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-serif font-black text-slate-900">Revenue Trajectory</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">6-Month Performance Forecast</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.analytics?.revenue_trend?.length ? data.analytics.revenue_trend : REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey={data?.analytics?.revenue_trend?.length ? "month" : "name"} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => `£${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Area type="monotone" dataKey={data?.analytics?.revenue_trend?.length ? "amount" : "revenue"} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-1 h-[400px]">
                    <ActivityFeedWidget activities={data?.recent_activities || []} />
                </motion.div>
            </div>

            {/* Row 4: Recent Applications */}
            <motion.div variants={itemVariants}>
                <RecentApplications />
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
