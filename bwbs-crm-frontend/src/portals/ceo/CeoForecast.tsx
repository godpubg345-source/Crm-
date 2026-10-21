import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    TrendingUp, Sparkles, Compass, AlertTriangle, CheckCircle2,
    Calendar, ArrowUpRight, Target, Lightbulb, SlidersHorizontal
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

const FORECAST_SCENARIOS = {
    conservative: [
        { period: 'Sep 26', students: 480, revenue: 672000 },
        { period: 'Nov 26', students: 260, revenue: 364000 },
        { period: 'Jan 27', students: 510, revenue: 714000 },
        { period: 'Mar 27', students: 290, revenue: 406000 },
        { period: 'May 27', students: 340, revenue: 476000 },
        { period: 'Sep 27', students: 620, revenue: 868000 },
    ],
    target: [
        { period: 'Sep 26', students: 580, revenue: 812000 },
        { period: 'Nov 26', students: 340, revenue: 476000 },
        { period: 'Jan 27', students: 650, revenue: 910000 },
        { period: 'Mar 27', students: 390, revenue: 546000 },
        { period: 'May 27', students: 440, revenue: 616000 },
        { period: 'Sep 27', students: 820, revenue: 1148000 },
    ],
    aggressive: [
        { period: 'Sep 26', students: 680, revenue: 952000 },
        { period: 'Nov 26', students: 420, revenue: 588000 },
        { period: 'Jan 27', students: 780, revenue: 1092000 },
        { period: 'Mar 27', students: 490, revenue: 686000 },
        { period: 'May 27', students: 560, revenue: 784000 },
        { period: 'Sep 27', students: 1050, revenue: 1470000 },
    ]
};

const INTAKE_PROJECTIONS = [
    { intake: 'Autumn 2026 (Live)', target: 580, pipeline: 615, confidence: '98%', status: 'ON TRACK' },
    { intake: 'Winter 2027 (Jan)', target: 650, pipeline: 410, confidence: '84%', status: 'ACCELERATING' },
    { intake: 'Spring 2027 (May)', target: 440, pipeline: 190, confidence: '72%', status: 'EARLY STAGE' },
    { intake: 'Autumn 2027 (Sep)', target: 820, pipeline: 280, confidence: '68%', status: 'MODELING' },
];

const CeoForecast = () => {
    const [scenario, setScenario] = useState<'conservative' | 'target' | 'aggressive'>('target');

    const activeData = FORECAST_SCENARIOS[scenario];
    const totalProjectedStudents = activeData.reduce((acc, curr) => acc + curr.students, 0);
    const totalProjectedRevenue = activeData.reduce((acc, curr) => acc + curr.revenue, 0);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HEADER & CONTROLS ─────────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                            Predictive Modeling
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">FY2026-2027 Strategic Horizon</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Growth Forecast</h1>
                    <p className="text-white/40 text-xs mt-1">Multi-scenario intake projections, revenue trajectory & capacity risk analysis.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                        {[
                            { id: 'conservative', label: 'Conservative (+8%)' },
                            { id: 'target', label: 'Target Plan (+22%)' },
                            { id: 'aggressive', label: 'Aggressive (+38%)' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setScenario(s.id as any)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    scenario === s.id
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── METRICS SUMMARY ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Projected Student Influx', val: `${totalProjectedStudents.toLocaleString()}`, sub: '12-Month Horizon', icon: Target, color: 'from-amber-500/20' },
                    { label: 'Forecasted Gross Revenue', val: `£${(totalProjectedRevenue / 1000000).toFixed(2)}M`, sub: 'Cumulative Commission Yield', icon: TrendingUp, color: 'from-emerald-500/20' },
                    { label: 'Model Confidence Level', val: scenario === 'conservative' ? '96%' : scenario === 'target' ? '88%' : '72%', sub: 'Monte Carlo Validated', icon: Compass, color: 'from-indigo-500/20' },
                    { label: 'Capacity Buffer', val: scenario === 'aggressive' ? '-14 Staff' : '+8 Staff', sub: scenario === 'aggressive' ? 'Hiring Required' : 'Adequately Staffed', icon: AlertTriangle, color: 'from-purple-500/20' },
                ].map((m) => (
                    <motion.div
                        key={m.label}
                        variants={item}
                        className="rounded-[2rem] p-7 border border-white/[0.07] bg-white/[0.03] relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                <m.icon className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">{m.label}</p>
                        <p className="text-3xl font-black text-white mt-1">{m.val}</p>
                        <p className="text-xs text-white/40 font-semibold mt-1">{m.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── MAIN FORECAST RECHART ───────────────────────────────── */}
            <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Projected Revenue by Intake Cycle</h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">12-Month Projections Under {scenario.toUpperCase()} Model</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400" />Commission (£)</div>
                    </div>
                </div>

                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `£${v / 1000}k`} />
                            <Tooltip
                                contentStyle={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: 12 }}
                                formatter={(value: any) => [`£${Number(value || 0).toLocaleString()}`, 'Projected Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fill="url(#forecastGrad)"
                                dot={{ r: 6, fill: '#f59e0b', stroke: '#0d0a1a', strokeWidth: 3 }}
                                activeDot={{ r: 8 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* ── INTAKE PIPELINE READINESS ───────────────────────────── */}
            <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">Intake Readiness Milestones</h2>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Enrollment Target vs Active Pipeline Ratio</p>
                    </div>
                    <Calendar className="w-5 h-5 text-amber-400" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {INTAKE_PROJECTIONS.map((intake) => (
                        <div key={intake.intake} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                    {intake.status}
                                </span>
                                <span className="text-xs font-black text-emerald-400">{intake.confidence} Conf.</span>
                            </div>

                            <h3 className="text-sm font-black text-white">{intake.intake}</h3>

                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-white/50">
                                    <span>Target Students:</span>
                                    <span className="font-bold text-white">{intake.target}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>In Pipeline:</span>
                                    <span className="font-bold text-amber-400">{intake.pipeline}</span>
                                </div>
                            </div>

                            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                                    style={{ width: `${Math.min(100, (intake.pipeline / intake.target) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CeoForecast;
