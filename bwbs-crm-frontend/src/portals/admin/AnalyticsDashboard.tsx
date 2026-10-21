import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Users, BadgeDollarSign, RefreshCw, UserCheck, Inbox
} from 'lucide-react';
import analyticsService from '../../services/analytics';
import { StatCard } from '../../components/dashboard/StatCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const COLORS = ['#6366f1', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#64748b'];

const PERIODS = [
    { value: 7, label: 'Last 7 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 3 Months' },
    { value: 365, label: 'Last Year' },
];

interface BranchPerformance {
    branch_id: string;
    branch_name: string;
    leads_total: number;
    conversions: number;
    conversion_rate: number;
    students_total: number;
    revenue: number;
    marketing_spend: number;
    cac: number | null;
}

interface CounselorKpi {
    counselor_id: string;
    counselor_name: string;
    branch_name: string;
    leads_assigned: number;
    students_converted: number;
    tasks_completed: number;
    sla_compliance_rate: number | null;
}

interface BranchForecast {
    branch_id: string;
    branch_name: string;
    lead_average: number;
    revenue_average: number;
    forecast: { month: string; projected_leads: number; projected_revenue: number }[];
}

const formatMoney = (value: number) => `£${Math.round(value).toLocaleString()}`;
const formatPercent = (value: number | null) => value === null ? '—' : `${(value * 100).toFixed(1)}%`;

const EmptyState = ({ message }: { message: string }) => (
    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center gap-3 text-slate-400">
        <Inbox className="w-8 h-8" />
        <p className="text-sm font-bold">{message}</p>
    </div>
);

const AnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState<'performance' | 'counselors' | 'forecast'>('performance');
    const [periodDays, setPeriodDays] = useState(30);

    const performanceQuery = useQuery<{ results: BranchPerformance[] }>({
        queryKey: ['analytics', 'performance', periodDays],
        queryFn: () => analyticsService.getBranchPerformance({ period_days: periodDays }),
    });

    const counselorQuery = useQuery<{ results: CounselorKpi[] }>({
        queryKey: ['analytics', 'counselors', periodDays],
        queryFn: () => analyticsService.getCounselorKpis({ period_days: periodDays }),
        enabled: activeTab === 'counselors',
    });

    const forecastQuery = useQuery<{ results: BranchForecast[] }>({
        queryKey: ['analytics', 'forecast'],
        queryFn: () => analyticsService.getForecast({ months: 6 }),
        enabled: activeTab === 'forecast',
    });

    const branches = useMemo(() => performanceQuery.data?.results ?? [], [performanceQuery.data]);

    const totals = useMemo(() => {
        const leads = branches.reduce((sum, b) => sum + b.leads_total, 0);
        const conversions = branches.reduce((sum, b) => sum + b.conversions, 0);
        return {
            revenue: branches.reduce((sum, b) => sum + b.revenue, 0),
            leads,
            conversionRate: leads ? (conversions / leads) * 100 : 0,
            students: branches.reduce((sum, b) => sum + b.students_total, 0),
        };
    }, [branches]);

    const revenueShare = branches.filter((b) => b.revenue > 0);

    const counselors = useMemo(
        () => [...(counselorQuery.data?.results ?? [])].sort((a, b) => b.students_converted - a.students_converted),
        [counselorQuery.data]
    );

    // Sum per-branch projections into one network-wide series
    const forecastSeries = useMemo(() => {
        const byMonth = new Map<string, { month: string; leads: number; revenue: number }>();
        for (const branch of forecastQuery.data?.results ?? []) {
            for (const point of branch.forecast) {
                const row = byMonth.get(point.month) ?? { month: point.month, leads: 0, revenue: 0 };
                row.leads += point.projected_leads;
                row.revenue += point.projected_revenue;
                byMonth.set(point.month, row);
            }
        }
        return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
    }, [forecastQuery.data]);

    const refetchAll = () => {
        performanceQuery.refetch();
        if (activeTab === 'counselors') counselorQuery.refetch();
        if (activeTab === 'forecast') forecastQuery.refetch();
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-white/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">

                <div className="relative z-10">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                        Reports
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Branch performance, counselor results and revenue projections.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <select
                        value={periodDays}
                        onChange={(e) => setPeriodDays(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#7c3aed]/20 transition-all font-bold"
                    >
                        {PERIODS.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={refetchAll}
                        title="Refresh"
                        className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${performanceQuery.isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit border border-slate-200/50">
                {(['performance', 'counselors', 'forecast'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab
                            ? 'bg-white text-[#7c3aed] shadow-md ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {activeTab === 'performance' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Revenue (£)" value={totals.revenue} icon={BadgeDollarSign} />
                        <StatCard title="New Leads" value={totals.leads} icon={TrendingUp} />
                        <StatCard title="Lead Conversion (%)" value={totals.conversionRate.toFixed(1)} icon={UserCheck} />
                        <StatCard title="New Students" value={totals.students} icon={Users} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200 min-h-[450px]">
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold text-slate-900">Leads vs Conversions</h3>
                                <p className="text-xs text-slate-500 mt-1">By branch, selected period</p>
                            </div>

                            <div className="h-[300px] w-full">
                                {performanceQuery.isLoading ? (
                                    <div className="h-full bg-slate-50 rounded-2xl animate-pulse" />
                                ) : branches.length === 0 ? (
                                    <EmptyState message="No branch data for this period." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={branches}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="branch_name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="leads_total" name="Leads" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="conversions" name="Converted" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-white rounded-xl p-6 border border-slate-200 flex flex-col">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900">Revenue Share</h3>
                                <p className="text-xs text-slate-500 mt-1">Paid revenue by branch</p>
                            </div>

                            {revenueShare.length === 0 ? (
                                <EmptyState message="No paid revenue in this period." />
                            ) : (
                                <>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={revenueShare}
                                                    nameKey="branch_name"
                                                    dataKey="revenue"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                >
                                                    {revenueShare.map((b, index) => (
                                                        <Cell key={b.branch_id} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatMoney(Number(value ?? 0))} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="space-y-2">
                                        {revenueShare.map((b, i) => (
                                            <div key={b.branch_id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                    <span className="text-xs font-bold text-slate-600">{b.branch_name}</span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-900">{formatMoney(b.revenue)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'counselors' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-2xl font-semibold text-slate-900">Counselor Performance</h3>
                        <p className="text-xs text-slate-500 mt-1">Selected period</p>
                    </div>
                    {counselorQuery.isLoading ? (
                        <div className="p-6"><div className="h-40 bg-slate-50 rounded-2xl animate-pulse" /></div>
                    ) : counselors.length === 0 ? (
                        <EmptyState message="No active counselors found." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Counselor</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Assigned</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks Done</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">On-time Tasks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {counselors.map((row) => (
                                        <tr key={row.counselor_id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-900">{row.counselor_name}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{row.branch_name}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{row.leads_assigned}</td>
                                            <td className="px-8 py-5 text-sm text-slate-700 font-bold">{row.students_converted}</td>
                                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">{row.tasks_completed}</td>
                                            <td className="px-8 py-5 text-sm font-semibold text-[#7c3aed]">{formatPercent(row.sla_compliance_rate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'forecast' && (
                <div className="bg-white rounded-xl p-6 border border-slate-200 min-h-[450px]">
                    <div className="mb-8">
                        <h3 className="text-2xl font-semibold text-slate-900">Next 6 Months</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Simple projection from the last 6 months' monthly average, all branches
                        </p>
                    </div>

                    <div className="h-[300px] w-full">
                        {forecastQuery.isLoading ? (
                            <div className="h-full bg-slate-50 rounded-2xl animate-pulse" />
                        ) : forecastSeries.length === 0 ? (
                            <EmptyState message="Not enough history to project yet." />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecastSeries}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis yAxisId="leads" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="revenue" dataKey="revenue" name="Projected revenue (£)" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                                    <Bar yAxisId="leads" dataKey="leads" name="Projected leads" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AnalyticsDashboard;
