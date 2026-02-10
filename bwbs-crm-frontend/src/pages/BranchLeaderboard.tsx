import { useQuery } from '@tanstack/react-query';
import { getBranchLeaderboard } from '../services/branches';
import { Trophy, TrendingUp, Users, Zap, Loader2, ArrowLeft, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const BranchLeaderboard = () => {
    const navigate = useNavigate();
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['branch-leaderboard'],
        queryFn: getBranchLeaderboard,
        refetchInterval: 30000, // Refresh every 30s
    });

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 lg:p-12 pb-24">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-16">
                <button
                    onClick={() => navigate('/branches')}
                    className="group mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#AD03DE] transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Command Center
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-2 h-10 bg-[#AD03DE] rounded-full shadow-[0_0_20px_rgba(173,3,222,0.3)]" />
                            <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-none">
                                Regional <span className="text-[#AD03DE]">Excellence</span>
                            </h1>
                        </div>
                        <p className="text-sm font-serif font-bold text-slate-500 max-w-lg leading-relaxed">
                            A live broadcast of the branch network's performance. Recognize the leaders, mobilize the outliers.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Top Node</p>
                            <p className="text-xl font-serif font-black text-slate-900">
                                {leaderboard[0]?.name || 'Analyzing...'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Rankings grid */}
            <main className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-6 text-slate-300">
                        <Loader2 className="w-12 h-12 animate-spin" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse">Synchronizing Global Stats</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-6"
                    >
                        {leaderboard.map((branch, index) => (
                            <motion.div
                                key={branch.id}
                                variants={item}
                                className={clsx(
                                    "group relative bg-white p-8 rounded-[3rem] border transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] flex flex-col md:flex-row md:items-center gap-10",
                                    index === 0 ? "border-[#AD03DE]/30 bg-gradient-to-br from-white to-[#AD03DE]/[0.02]" : "border-slate-100 hover:border-[#AD03DE]/10"
                                )}
                            >
                                {/* Rank */}
                                <div className="flex items-center gap-8">
                                    <div className={clsx(
                                        "w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-serif font-black transition-all duration-700 group-hover:rotate-12",
                                        index === 0 ? "bg-slate-900 text-white shadow-2xl shadow-slate-400" :
                                            index === 1 ? "bg-slate-200 text-slate-600 shadow-xl" :
                                                index === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-300"
                                    )}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tighter group-hover:text-[#AD03DE] transition-colors">{branch.name}</h3>
                                            <span className="text-[10px] font-mono font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-3 py-1 rounded-lg border border-[#AD03DE]/10">
                                                {branch.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {index === 0 ? 'Empire Vanguard' : index < 3 ? 'Elite Node' : 'Active Operation'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 md:px-10 md:border-x border-slate-50">
                                    <StatItem label="Conversion" value={`${branch.conversion_rate}%`} icon={Zap} color="text-amber-500" />
                                    <StatItem label="Active Students" value={branch.active_students} icon={Star} color="text-[#AD03DE]" />
                                    <StatItem label="Total Leads" value={branch.total_leads} icon={TrendingUp} color="text-blue-500" />
                                    <StatItem label="Deployment" value="Strategic" icon={Users} color="text-slate-400" />
                                </div>

                                {/* Rank Badge */}
                                <div className="hidden lg:flex flex-col items-center justify-center w-32 border-l border-slate-50 pl-10">
                                    <div className="text-5xl mb-2">{branch.rank_emoji}</div>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Status</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

const StatItem = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <Icon className={clsx("w-3.5 h-3.5", color)} />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-xl font-serif font-black text-slate-900">{value}</p>
    </div>
);

export default BranchLeaderboard;
