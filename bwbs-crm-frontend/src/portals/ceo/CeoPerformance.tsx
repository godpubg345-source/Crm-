import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import {
    BarChart3, Globe, Award, ShieldCheck, CheckCircle2,
    ArrowUpRight, ArrowDownRight, Compass, Zap, Target,
    FileCheck, Users, Landmark
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

const FUNNEL_STAGES = [
    { stage: 'Leads Ingested', count: 1840, rate: '100%', color: '#6366f1' },
    { stage: 'Qualified Students', count: 1210, rate: '65.7%', color: '#8b5cf6' },
    { stage: 'Applications Filed', count: 840, rate: '45.6%', color: '#ec4899' },
    { stage: 'Offers Received', count: 680, rate: '36.9%', color: '#f59e0b' },
    { stage: 'Visas Granted', count: 620, rate: '33.7%', color: '#10b981' },
    { stage: 'Enrolled & Settled', count: 580, rate: '31.5%', color: '#14b8a6' },
];

const REGIONAL_METRICS = [
    { region: 'United Kingdom & Europe', applications: 540, conversion: '82%', visas: '98%', health: 'EXCELLENT', color: '#f59e0b' },
    { region: 'South Asia (PK, BD, IN)', applications: 620, conversion: '74%', visas: '93%', health: 'STABLE', color: '#10b981' },
    { region: 'Middle East & Gulf', applications: 280, conversion: '79%', visas: '96%', health: 'GROWING', color: '#6366f1' },
    { region: 'Sub-Saharan Africa', applications: 220, conversion: '68%', visas: '89%', health: 'STABLE', color: '#ec4899' },
];

const DESTINATION_RATES = [
    { destination: 'United Kingdom', rate: 96, apps: 580, fill: '#f59e0b' },
    { destination: 'Australia', rate: 91, apps: 160, fill: '#10b981' },
    { destination: 'United States', rate: 87, apps: 120, fill: '#6366f1' },
    { destination: 'Canada', rate: 83, apps: 95, fill: '#ec4899' },
    { destination: 'Ireland & EU', rate: 94, apps: 65, fill: '#14b8a6' },
];

const VELOCITY_DATA = [
    { month: 'Apr', processed: 95, approved: 88 },
    { month: 'May', processed: 110, approved: 102 },
    { month: 'Jun', processed: 135, approved: 128 },
    { month: 'Jul', processed: 160, approved: 152 },
    { month: 'Aug', processed: 210, approved: 198 },
    { month: 'Sep', processed: 245, approved: 232 },
];

const CeoPerformance = () => {
    const [selectedTab, setSelectedTab] = useState<'funnel' | 'regional'>('funnel');

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HEADER ────────────────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                            Operational Excellence
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">Global Quality Scorecard</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Global Performance</h1>
                    <p className="text-white/40 text-xs mt-1">Cross-regional conversion velocity, visa success indices & operational yield.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                        <button
                            onClick={() => setSelectedTab('funnel')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                selectedTab === 'funnel'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            Conversion Funnel
                        </button>
                        <button
                            onClick={() => setSelectedTab('regional')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                selectedTab === 'regional'
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            Territory Matrix
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── TOP KPI TILES ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Visa Success Rate', val: '94.6%', change: '+2.1% YoY', up: true, icon: ShieldCheck, color: 'from-emerald-500/20' },
                    { label: 'Application Conversion', val: '74.2%', change: '+4.5%', up: true, icon: Target, color: 'from-amber-500/20' },
                    { label: 'Avg Processing Cycle', val: '18 Days', change: '-3 days faster', up: true, icon: Zap, color: 'from-indigo-500/20' },
                    { label: 'Student Satisfaction', val: '4.92 / 5', change: '99.1% Positive', up: true, icon: Award, color: 'from-purple-500/20' },
                ].map((m) => (
                    <motion.div
                        key={m.label}
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
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {m.change}
                                </div>
                            </div>
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">{m.label}</p>
                            <p className="text-3xl lg:text-4xl font-black text-white mt-1 tracking-tight">{m.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── INTERACTIVE FUNNEL / CHARTS ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 2 Cols: Funnel or Velocity */}
                <motion.div variants={item} className="lg:col-span-2 rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">End-to-End Recruitment Funnel</h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Lead To Enrolled Attrition Analysis</p>
                        </div>
                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                            31.5% Net Conversion
                        </span>
                    </div>

                    <div className="space-y-4">
                        {FUNNEL_STAGES.map((s, idx) => (
                            <div key={s.stage} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-[11px] font-black text-white/50">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-bold text-white">{s.stage}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black text-white">{s.count.toLocaleString()}</span>
                                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-white/[0.05] text-white/70">{s.rate}</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: s.rate }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{ background: s.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 1 Col: Destination Acceptance & Visas */}
                <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Visa Success</h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">By Study Destination</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DESTINATION_RATES} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                <XAxis type="number" domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `${v}%`} />
                                <YAxis dataKey="destination" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700 }} width={90} />
                                <Tooltip
                                    contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 11 }}
                                    formatter={(v: any) => [`${v}%`, 'Visa Rate']}
                                />
                                <Bar dataKey="rate" radius={[0, 8, 8, 0]}>
                                    {DESTINATION_RATES.map((entry) => (
                                        <Cell key={entry.destination} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ── REGIONAL PERFORMANCE MATRIX ─────────────────────────── */}
            <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Territory Operational Health</h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Cross-regional Branch Diagnostics</p>
                    </div>
                    <Globe className="w-5 h-5 text-amber-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {REGIONAL_METRICS.map((reg) => (
                        <div key={reg.region} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                    reg.health === 'EXCELLENT'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                }`}>
                                    {reg.health}
                                </span>
                                <span className="text-xs font-black text-white/40">{reg.applications} Apps</span>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-white leading-snug">{reg.region}</h3>
                                <p className="text-xs text-white/30 font-semibold mt-1">Conversion: <span className="text-white font-bold">{reg.conversion}</span></p>
                            </div>

                            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                                <span className="text-[11px] text-white/40 font-semibold">Visa Success</span>
                                <span className="text-sm font-black text-emerald-400">{reg.visas}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CeoPerformance;
