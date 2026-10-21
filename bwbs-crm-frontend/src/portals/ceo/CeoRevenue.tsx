import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
    BadgeDollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
    Download, Filter, Building2, CheckCircle2, Clock, AlertCircle,
    Calendar, CreditCard, DollarSign, Wallet
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

const MONTHLY_REVENUE = [
    { month: 'Apr', gross: 142000, netCommission: 38000, target: 120000 },
    { month: 'May', gross: 158000, netCommission: 42000, target: 130000 },
    { month: 'Jun', gross: 175000, netCommission: 48000, target: 140000 },
    { month: 'Jul', gross: 162000, netCommission: 44000, target: 145000 },
    { month: 'Aug', gross: 198000, netCommission: 54000, target: 160000 },
    { month: 'Sep', gross: 224000, netCommission: 62000, target: 180000 },
];

const CURRENCY_DISTRIBUTION = [
    { name: 'GBP (£)', value: 58, color: '#f59e0b' },
    { name: 'USD ($)', value: 24, color: '#6366f1' },
    { name: 'EUR (€)', value: 12, color: '#10b981' },
    { name: 'AUD (A$)', value: 6, color: '#ec4899' },
];

const TOP_UNIVERSITIES = [
    { name: 'University of Greenwich', country: 'UK', students: 38, commission: '£45,600', growth: '+24%' },
    { name: 'Coventry University', country: 'UK', students: 32, commission: '£38,400', growth: '+18%' },
    { name: 'University of Hertfordshire', country: 'UK', students: 28, commission: '£33,600', growth: '+12%' },
    { name: 'Ulster University (London)', country: 'UK', students: 24, commission: '£28,800', growth: '+31%' },
    { name: 'University of Chester', country: 'UK', students: 19, commission: '£22,800', growth: '+9%' },
];

const RECENT_TRANSACTIONS = [
    { id: 'INV-2026-089', university: 'University of Greenwich', amount: '£14,200', date: '16 Sep 2026', status: 'PAID', ref: 'Autumn Intake Q1' },
    { id: 'INV-2026-088', university: 'Coventry University', amount: '£11,800', date: '14 Sep 2026', status: 'PAID', ref: 'Direct Commission' },
    { id: 'INV-2026-087', university: 'University of Hertfordshire', amount: '£9,450', date: '12 Sep 2026', status: 'PROCESSING', ref: 'Intake Milestone' },
    { id: 'INV-2026-086', university: 'Ulster University', amount: '£7,200', date: '09 Sep 2026', status: 'PAID', ref: 'Student Retainer' },
    { id: 'INV-2026-085', university: 'University of Chester', amount: '£5,600', date: '05 Sep 2026', status: 'PENDING', ref: 'Late CAS Release' },
];

const CeoRevenue = () => {
    const [period, setPeriod] = useState<'30d' | '90d' | 'ytd'>('90d');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    const filteredTransactions = filterStatus === 'ALL'
        ? RECENT_TRANSACTIONS
        : RECENT_TRANSACTIONS.filter(t => t.status === filterStatus);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HEADER & CONTROLS ─────────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                            Fiscal Intelligence
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">Q3 FY2026 Live Audit</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Revenue Intelligence</h1>
                    <p className="text-white/40 text-xs mt-1">Multi-currency commission accruals, university settlements & forecast velocity.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                        {(['30d', '90d', 'ytd'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    period === p
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {p === '30d' ? '30 Days' : p === '90d' ? 'Quarter' : 'YTD'}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => alert('Executive Revenue Dossier exported successfully to PDF.')}
                        className="flex items-center gap-2 px-5 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-md"
                    >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        Export Ledger
                    </button>
                </div>
            </motion.div>

            {/* ── METRICS TILES ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { title: 'Gross Revenue MTD', value: '£224,500', change: '+18.4%', up: true, icon: DollarSign, color: 'from-amber-500/20' },
                    { title: 'Net Agency Commission', value: '£62,800', change: '+22.1%', up: true, icon: Wallet, color: 'from-emerald-500/20' },
                    { title: 'Pending Settlement', value: '£38,450', change: '5 Universities', up: false, icon: Clock, color: 'from-indigo-500/20' },
                    { title: 'Avg Yield per Student', value: '£1,420', change: '+8.3%', up: true, icon: TrendingUp, color: 'from-purple-500/20' },
                ].map((m) => (
                    <motion.div
                        key={m.title}
                        variants={item}
                        whileHover={{ y: -3 }}
                        className="rounded-[2rem] p-7 border border-white/[0.07] bg-white/[0.03] relative overflow-hidden group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${m.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                    <m.icon className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                    m.up ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {m.up ? <ArrowUpRight className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {m.change}
                                </div>
                            </div>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">{m.title}</p>
                            <p className="text-3xl lg:text-4xl font-black text-white mt-1 tracking-tight">{m.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── CHARTS ROW ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Area Chart (2 Cols) */}
                <motion.div variants={item} className="lg:col-span-2 rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Revenue vs Net Commission Velocity</h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Rolling 6-Month Trendline</p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" />Gross Revenue</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" />Net Commission</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-1.5 rounded-full bg-white/20" />Target</div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `£${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: 12 }}
                                    formatter={(value: any) => [`£${Number(value || 0).toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.15)" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="gross" stroke="#f59e0b" strokeWidth={3} fill="url(#grossGrad)" />
                                <Area type="monotone" dataKey="netCommission" stroke="#10b981" strokeWidth={3} fill="url(#netGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Currency Breakdown (1 Col) */}
                <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03] flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Currency Exposure</h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Gross Revenue Split</p>
                        <div className="h-44 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={CURRENCY_DISTRIBUTION} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={4}>
                                        {CURRENCY_DISTRIBUTION.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 11 }}
                                        formatter={(val: any) => [`${val}%`, 'Share']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        {CURRENCY_DISTRIBUTION.map((c) => (
                            <div key={c.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                                    <span className="text-white/70 font-semibold">{c.name}</span>
                                </div>
                                <span className="text-white font-black">{c.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── BOTTOM ROW: TOP PARTNERS & RECENT SETTLEMENTS ──────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Top University Partners */}
                <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-white">Top University Yields</h3>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em]">Q3 Commission Generators</p>
                        </div>
                        <Building2 className="w-5 h-5 text-white/30" />
                    </div>

                    <div className="space-y-4">
                        {TOP_UNIVERSITIES.map((u, i) => (
                            <div key={u.name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-xs">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">{u.name}</p>
                                        <p className="text-[10px] text-white/30 font-semibold mt-0.5">{u.students} Students Enrolled • {u.country}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-amber-400">{u.commission}</p>
                                    <span className="text-[10px] font-bold text-emerald-400">{u.growth}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Invoices / Settlements */}
                <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-white">Institutional Settlements</h3>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em]">Direct Commission Invoices</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-[10px]">
                            {['ALL', 'PAID', 'PENDING'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-2.5 py-1 rounded-lg font-black ${
                                        filterStatus === s ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                        {filteredTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-white/50" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white">{tx.id}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                                tx.status === 'PAID'
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : tx.status === 'PROCESSING'
                                                    ? 'bg-indigo-500/15 text-indigo-400'
                                                    : 'bg-amber-500/15 text-amber-400'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-white/50 font-semibold mt-0.5">{tx.university}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white">{tx.amount}</p>
                                    <p className="text-[10px] text-white/30 font-semibold">{tx.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CeoRevenue;
