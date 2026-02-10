import { useQuery } from '@tanstack/react-query';
import { getEmployeePerformance, getEmployeeLeaderboard } from '../services/users';
import {
    Trophy,
    Zap,
    Star,
    TrendingUp,
    Award,
    ShieldCheck,
    Target,
    Users,
    ArrowUpRight,
    Loader2,
    Lock
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const EmployeeArena = () => {
    const { data: performance, isLoading: isLoadingPerf } = useQuery({
        queryKey: ['employee-performance'],
        queryFn: getEmployeePerformance,
    });

    const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
        queryKey: ['employee-leaderboard'],
        queryFn: () => getEmployeeLeaderboard(),
    });

    if (isLoadingPerf || isLoadingLeaderboard) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-[#AD03DE]" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Synchronizing Arena Status</p>
            </div>
        );
    }

    const nextLevelXP = 1000;
    const progress = (performance?.xp || 0) % nextLevelXP;
    const progressPercent = (progress / nextLevelXP) * 100;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 pb-32">
            {/* Header / Personal Rank */}
            <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-12 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_20px_rgba(173,3,222,0.4)]" />
                        <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-none uppercase">
                            The <span className="text-[#AD03DE]">Arena</span>
                        </h1>
                    </div>
                    <p className="text-sm font-serif font-bold text-slate-400 max-w-md">
                        Institutional excellence through competitive intelligence. Track your rank, unlock tiers, and dominate the network.
                    </p>
                </div>

                <div className="flex items-center gap-8 bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-50 flex items-center justify-center bg-[#AD03DE]/5">
                            <span className="text-4xl font-serif font-black text-[#AD03DE]">{performance?.level || 1}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg border border-slate-700">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Operative Standing</p>
                        <p className="text-2xl font-serif font-black text-slate-900 leading-none mb-4">Elite Vanguard</p>
                        <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className="h-full bg-gradient-to-r from-[#AD03DE] to-indigo-500"
                            />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                            {progress} / {nextLevelXP} XP to Level {performance?.level ? performance.level + 1 : 2}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Stats Grid */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <StatCard
                            icon={Trophy}
                            label="Total Points"
                            value={performance?.points || 0}
                            color="bg-amber-50 text-amber-500"
                            subtitle="Lifetime XP Accumulated"
                        />
                        <StatCard
                            icon={Zap}
                            label="Conversions"
                            value={performance?.total_conversions || 0}
                            color="bg-[#AD03DE]/5 text-[#AD03DE]"
                            subtitle="Successful Enrollments"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Revenue Power"
                            value={`$${Number(performance?.revenue_generated || 0).toLocaleString()}`}
                            color="bg-emerald-50 text-emerald-500"
                            subtitle="Fee Impact Contribution"
                        />
                        <StatCard
                            icon={ShieldCheck}
                            label="Pending Payout"
                            value={`$${Number(performance?.wallet_balance || 0).toLocaleString()}`}
                            color="bg-indigo-50 text-indigo-500"
                            subtitle="Unlocked Commission"
                        />
                    </div>

                    {/* Progress to next milestone */}
                    <div className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#AD03DE]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <Target className="w-8 h-8 text-[#AD03DE]" />
                                <h3 className="text-3xl font-serif font-black tracking-tighter uppercase">Quarterly Objective</h3>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Master Closer Tier</p>
                                        <p className="text-2xl font-serif font-black">65% Complete</p>
                                    </div>
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                                        <div className="h-full w-[65%] bg-[#AD03DE] rounded-full shadow-[0_0_20px_rgba(173,3,222,0.5)]" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Badge label="12 Sales Away" icon={ArrowUpRight} />
                                    <Badge label="Top 5% Network" icon={Award} />
                                    <Badge label="Bonus Eligible" icon={Zap} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Leaderboard */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Global Rankings</h3>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-8 space-y-4">
                        {leaderboard.map((user, idx) => (
                            <div
                                key={user.id}
                                className={clsx(
                                    "group flex items-center justify-between p-5 rounded-3xl transition-all duration-500 hover:bg-slate-50",
                                    idx === 0 ? "bg-[#AD03DE]/5 border border-[#AD03DE]/10 shadow-lg shadow-[#AD03DE]/5" : "border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black shadow-inner",
                                        idx === 0 ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-300"
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-serif font-black text-slate-800 group-hover:text-[#AD03DE] transition-colors">{user.first_name} {user.last_name}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-serif font-black text-slate-900">{user.performance?.points || 0}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Points</p>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#AD03DE] transition-all border-t border-slate-50 mt-4">
                            Expand Intelligence Registry
                        </button>
                    </div>

                    {/* Locked Modules */}
                    <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 flex items-center gap-6 opacity-60">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-200">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Locked Module</p>
                            <p className="text-sm font-serif font-black text-slate-400">Advanced Analytics Tier 2</p>
                            <p className="text-[10px] font-bold text-[#AD03DE] mt-1">Requires Level 5</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, subtitle }: any) => (
    <div className="group bg-white p-10 rounded-[3.5rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-2xl transition-all duration-700">
        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-inner", color)}>
            <Icon className="w-7 h-7" />
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">{label}</p>
            <p className="text-4xl font-serif font-black text-slate-900 tracking-tighter group-hover:translate-x-1 transition-transform">{value}</p>
            <p className="text-[11px] font-serif font-bold text-slate-400 pt-3 border-t border-slate-50 mt-4">{subtitle}</p>
        </div>
    </div>
);

const Badge = ({ label, icon: Icon }: any) => (
    <span className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#AD03DE]">
        <Icon className="w-3 h-3" />
        {label}
    </span>
);

export default EmployeeArena;
