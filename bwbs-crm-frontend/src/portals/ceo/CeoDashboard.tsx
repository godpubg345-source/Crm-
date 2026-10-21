import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/dashboard';
import type { DashboardResponse } from '../../services/dashboard';
import { motion, type Variants } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    TrendingUp, Users, BadgeDollarSign, FileText,
    Globe, ArrowUpRight, ArrowDownRight, Zap,
    ShieldCheck, Building2, Target, Activity
} from 'lucide-react';
import { getCurrentUser } from '../../services/auth';

const REVENUE_DATA = [
    { month: 'Oct', revenue: 112000, target: 100000 },
    { month: 'Nov', revenue: 98000, target: 105000 },
    { month: 'Dec', revenue: 145000, target: 120000 },
    { month: 'Jan', revenue: 132000, target: 130000 },
    { month: 'Feb', revenue: 167000, target: 140000 },
    { month: 'Mar', revenue: 189000, target: 160000 },
];

const BRANCH_DATA = [
    { branch: 'London', students: 142, revenue: 84000, color: '#f59e0b' },
    { branch: 'Dubai', students: 98, revenue: 61000, color: '#6366f1' },
    { branch: 'Dhaka', students: 76, revenue: 42000, color: '#10b981' },
    { branch: 'Manchester', students: 54, revenue: 31000, color: '#ec4899' },
    { branch: 'Islamabad', students: 41, revenue: 24000, color: '#8b5cf6' },
];

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

// ── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({
    title, value, subtitle, icon: Icon, up, color
}: {
    title: string; value: string | number; subtitle: string;
    icon: any; up?: boolean; color: string;
}) => (
    <motion.div
        variants={item}
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-[2rem] p-7 border border-white/[0.07] bg-white/[0.04] backdrop-blur-sm group"
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${color} to-transparent`} />
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: color.includes('amber') ? '#f59e0b' : '#6366f1' }} />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white/70" />
                </div>
                {up !== undefined && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${up ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {subtitle}
                    </div>
                )}
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2">{title}</p>
            <p className="text-4xl font-black text-white tracking-tight">{value}</p>
            {up === undefined && <p className="text-white/30 text-xs mt-2 font-semibold">{subtitle}</p>}
        </div>
    </motion.div>
);

// ── Main CEO Dashboard ───────────────────────────────────────────────────────
const CeoDashboard = () => {
    const user = getCurrentUser();
    const { data } = useQuery<DashboardResponse>({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
        refetchInterval: 60000,
    });
    const stats = data?.stats;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HERO BANNER ─────────────────────────────────────── */}
            <motion.div
                variants={item}
                className="relative overflow-hidden rounded-[2.5rem] p-10 lg:p-14"
                style={{
                    background: "linear-gradient(135deg, #1a1000 0%, #0d0a1a 50%, #050810 100%)"
                }}
            >
                {/* Radial spotlight */}
                <div className="absolute top-0 left-0 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.025]" style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="px-4 py-2 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.3em]">Executive Suite</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                </span>
                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Live Data</span>
                            </div>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3">
                            <span className="text-white">Good day, </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                                {user?.first_name || 'CEO'}
                            </span>
                        </h1>
                        <p className="text-white/40 text-sm font-medium">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-7">
                            {[
                                { icon: Activity, label: `${stats?.pending_tasks || 46} Open Tasks`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                                { icon: ShieldCheck, label: `${stats?.pending_visas || 0} Visa Alerts`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
                                { icon: Target, label: '94% Target Hit', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                            ].map((badge) => (
                                <div key={badge.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${badge.color}`}>
                                    <badge.icon className="w-3.5 h-3.5" />
                                    {badge.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Big revenue number */}
                    <div className="text-right">
                        <p className="text-white/25 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Revenue MTD</p>
                        <p className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-500 leading-none">
                            £{((stats?.total_revenue || 189000) / 1000).toFixed(0)}k
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-3 text-emerald-400">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="text-sm font-black">+18.3% vs last month</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── KPI GRID ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard title="Total Students" value={stats?.total_students || 0} subtitle="+12 this week" icon={Users} up={true} color="from-amber-500/10" />
                <KpiCard title="Active Applications" value={stats?.total_applications || 0} subtitle="+5 today" icon={FileText} up={true} color="from-indigo-500/10" />
                <KpiCard title="Branch Network" value="5 Active" subtitle="Global coverage" icon={Globe} color="from-emerald-500/10" />
                <KpiCard title="Conversion Rate" value="67%" subtitle="-2% vs target" icon={TrendingUp} up={false} color="from-rose-500/10" />
            </div>

            {/* ── CHARTS ROW ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue chart — 2/3 width */}
                <motion.div
                    variants={item}
                    className="lg:col-span-2 rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Revenue vs Target</h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">6-Month Executive Overview</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" />Revenue</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full bg-white/20" />Target</div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ceoRevGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `£${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', color: '#fff', fontSize: 12 }}
                                    cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    formatter={(value: any) => [`£${Number(value || 0).toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.15)" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fill="url(#ceoRevGrad)"
                                    dot={{ r: 5, fill: '#f59e0b', stroke: '#0d0a1a', strokeWidth: 3 }}
                                    activeDot={{ r: 7 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Branch performance — 1/3 */}
                <motion.div
                    variants={item}
                    className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]"
                >
                    <h2 className="text-xl font-black text-white mb-1">Branch Revenue</h2>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mb-8">Performance Snapshot</p>
                    <div className="space-y-4">
                        {BRANCH_DATA.map((branch, i) => (
                            <div key={branch.branch}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5 text-white/30" />
                                        <span className="text-xs font-bold text-white/70">{branch.branch}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">£{(branch.revenue / 1000).toFixed(0)}k</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(branch.revenue / 84000) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ background: branch.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Branch students bar chart */}
                    <div className="mt-8 pt-6 border-t border-white/[0.05]">
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mb-4">Students by Branch</p>
                        <div className="h-28">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BRANCH_DATA} barSize={12}>
                                    <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 8, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: 11 }}
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    />
                                    <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                                        {BRANCH_DATA.map((entry) => (
                                            <Cell key={entry.branch} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── BOTTOM METRICS ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Visa Success Rate', value: '91%', note: '↑ 3% vs last quarter', color: 'text-emerald-400' },
                    { label: 'Avg. Counsellor Rating', value: '4.8★', note: 'Out of 5.0 — Excellent', color: 'text-amber-400' },
                    { label: 'Applications This Month', value: stats?.total_applications || 25, note: 'Pipeline Flow Active', color: 'text-indigo-400' },
                ].map((m) => (
                    <motion.div key={m.label} variants={item}
                        className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03] flex flex-col gap-3"
                    >
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">{m.label}</p>
                        <p className={`text-5xl font-black ${m.color}`}>{m.value}</p>
                        <p className="text-white/25 text-xs font-semibold">{m.note}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default CeoDashboard;
