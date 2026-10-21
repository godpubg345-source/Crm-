import { useQuery } from '@tanstack/react-query';
import { getBranchLeaderboard } from '../../services/branches';
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
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 pb-24">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-6">
                <button
                    onClick={() => navigate('/admin/team/branches')}
                    className="group mb-8 flex items-center gap-3 text-xs font-semibold text-slate-400 hover:text-[#7c3aed] transition-all"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform" />
                    Back to branches
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">
                                Branch <span className="text-[#7c3aed]">Leaderboard</span>
                            </h1>
                        </div>
                        <p className="text-sm font-bold text-slate-500 max-w-lg leading-relaxed">
                            See which branches are converting the most leads.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Top branch</p>
                            <p className="text-xl font-semibold text-slate-900">
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
                        <p className="text-xs font-bold animate-pulse">Loading stats...</p>
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
                                    "group relative bg-white p-6 rounded-2xl border transition-all duration-700 flex flex-col md:flex-row md:items-center gap-6",
                                    index === 0 ? "border-[#7c3aed]/30 bg-gradient-to-br from-white to-[#7c3aed]/[0.02]" : "border-slate-100 hover:border-[#7c3aed]/10"
                                )}
                            >
                                {/* Rank */}
                                <div className="flex items-center gap-8">
                                    <div className={clsx(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-semibold transition-all duration-700 ",
                                        index === 0 ? "bg-slate-900 text-white shadow-sm " :
                                            index === 1 ? "bg-slate-200 text-slate-600 shadow-sm" :
                                                index === 2 ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-300"
                                    )}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-3xl font-semibold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors">{branch.name}</h3>
                                            <span className="text-xs font-mono font-bold text-[#7c3aed] bg-[#7c3aed]/5 px-3 py-1 rounded-lg border border-[#7c3aed]/10">
                                                {branch.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-xs text-slate-500">
                                                {index === 0 ? 'Top branch' : index < 3 ? 'Top 3' : 'Branch'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 md:px-10 md:border-x border-slate-50">
                                    <StatItem label="Conversion" value={`${branch.conversion_rate}%`} icon={Zap} color="text-amber-500" />
                                    <StatItem label="Active Students" value={branch.active_students} icon={Star} color="text-[#7c3aed]" />
                                    <StatItem label="Total Leads" value={branch.total_leads} icon={TrendingUp} color="text-blue-500" />
                                </div>

                                {/* Rank Badge */}
                                <div className="hidden lg:flex flex-col items-center justify-center w-32 border-l border-slate-50 pl-10">
                                    <div className="text-3xl mb-2">{branch.rank_emoji}</div>
                                    <span className="text-[11px] font-semibold text-slate-300">Status</span>
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
            <span className="text-[11px] font-semibold text-slate-300">{label}</span>
        </div>
        <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
);

export default BranchLeaderboard;
