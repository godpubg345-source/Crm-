import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    Users, Award, TrendingUp, CheckCircle2, Star,
    Shield, Briefcase, UserCheck, Search, Filter,
    Sparkles, ArrowUpRight, BarChart2
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

const TOP_COUNSELORS = [
    { name: 'Sarah Jenkins', branch: 'London HQ', students: 48, conversions: 42, rate: '87.5%', rating: 4.9, avatar: 'SJ' },
    { name: 'Omar Farooq', branch: 'Dubai Hub', students: 39, conversions: 34, rate: '87.2%', rating: 4.9, avatar: 'OF' },
    { name: 'Ayesha Rahman', branch: 'Dhaka Centre', students: 44, conversions: 37, rate: '84.1%', rating: 4.8, avatar: 'AR' },
    { name: 'Liam Hughes', branch: 'Manchester', students: 31, conversions: 26, rate: '83.9%', rating: 4.8, avatar: 'LH' },
    { name: 'Bilal Khan', branch: 'Islamabad', students: 35, conversions: 29, rate: '82.8%', rating: 4.7, avatar: 'BK' },
    { name: 'Ngozi Adeleke', branch: 'Lagos Hub', students: 28, conversions: 23, rate: '82.1%', rating: 4.7, avatar: 'NA' },
];

const DEPARTMENTS = [
    { name: 'Student Counseling', count: 72, share: '48.6%', color: '#f59e0b' },
    { name: 'Admissions & Processing', count: 34, share: '23.0%', color: '#6366f1' },
    { name: 'Visa & Compliance', count: 18, share: '12.2%', color: '#10b981' },
    { name: 'Marketing & Outreach', count: 14, share: '9.5%', color: '#ec4899' },
    { name: 'Executive & Finance', count: 10, share: '6.7%', color: '#8b5cf6' },
];

const CeoWorkforce = () => {
    const [search, setSearch] = useState('');

    const filteredCounselors = TOP_COUNSELORS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.branch.toLowerCase().includes(search.toLowerCase())
    );

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
                            Human Capital
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">148 Personnel Global Roster</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Workforce Analytics</h1>
                    <p className="text-white/40 text-xs mt-1">Counselor conversion ratios, workload saturation & departmental productivity.</p>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search counselor or branch..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 w-64"
                    />
                </div>
            </motion.div>

            {/* ── KPI TILES ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Global Headcount', val: '148 Staff', sub: '+12 Hired This Quarter', icon: Users, color: 'from-amber-500/20' },
                    { label: 'Certified Counselors', val: '72 Active', sub: '98% Accredited', icon: UserCheck, color: 'from-indigo-500/20' },
                    { label: 'Avg Student Load', val: '18.5 Cases', sub: 'Healthy Saturation Zone', icon: Briefcase, color: 'from-emerald-500/20' },
                    { label: 'Staff Retention', val: '96.8%', sub: 'Industry Benchmark 82%', icon: Award, color: 'from-purple-500/20' },
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

            {/* ── DEPARTMENTS & LEADERBOARD ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Department Headcount Breakdown */}
                <motion.div variants={item} className="rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <h2 className="text-xl font-black text-white mb-1">Department Structure</h2>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Staff Distribution</p>

                    <div className="space-y-4">
                        {DEPARTMENTS.map((dept) => (
                            <div key={dept.name}>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="font-bold text-white/80">{dept.name}</span>
                                    <span className="font-black text-white">{dept.count} ({dept.share})</span>
                                </div>
                                <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: dept.share, background: dept.color }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/[0.06]">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                                <span className="font-bold text-amber-300">Target Hiring:</span> 8 new counselors authorized for Dubai & Lagos Autumn Intake expansion.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Top Counselors Leaderboard (2 Cols) */}
                <motion.div variants={item} className="lg:col-span-2 rounded-[2rem] p-8 border border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Executive Counselor Leaderboard</h2>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mt-1">Top Converting Counselors (Q3 FY26)</p>
                        </div>
                        <Award className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="space-y-3">
                        {filteredCounselors.map((c, i) => (
                            <div key={c.name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                                        i === 0 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' :
                                        i === 1 ? 'bg-slate-300 text-black' :
                                        i === 2 ? 'bg-amber-800 text-white' :
                                        'bg-white/[0.06] text-white/70'
                                    }`}>
                                        {c.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50 font-semibold">{c.branch}</span>
                                        </div>
                                        <p className="text-xs text-white/30 font-semibold mt-0.5">{c.students} Active Cases • {c.conversions} Enrolled</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 text-right">
                                    <div>
                                        <p className="text-xs font-black text-emerald-400">{c.rate}</p>
                                        <p className="text-[9px] text-white/30 uppercase font-bold">Conversion</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-300 flex items-center gap-0.5 justify-end">
                                            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                            {c.rating}
                                        </p>
                                        <p className="text-[9px] text-white/30 uppercase font-bold">Rating</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CeoWorkforce;
