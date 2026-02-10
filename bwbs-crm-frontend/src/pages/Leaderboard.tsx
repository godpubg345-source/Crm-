import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../services/leads';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

const Leaderboard = () => {
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: getLeaderboard,
        refetchInterval: 30000, // Refresh every 30s
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-serif mb-2">
                        Sales <span className="text-[#AD03DE]">Leaderboard</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        Counselor Performance & Conversion Analytics
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#AD03DE]">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Performer</p>
                            <p className="text-lg font-black text-slate-900 font-serif">
                                {leaderboard[0]?.name || '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Leaderboard Table */}
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rank</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Counselor</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Conversions</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Hot Leads</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Efficiency</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Total Leads</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-8 py-6">
                                            <div className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : leaderboard.map((entry, index) => {
                                const efficiency = entry.total_leads > 0
                                    ? Math.round((entry.conversions / entry.total_leads) * 100)
                                    : 0;

                                return (
                                    <tr key={entry.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg font-serif ${index === 0 ? 'bg-yellow-100 text-yellow-700 shadow-sm' :
                                                    index === 1 ? 'bg-slate-100 text-slate-600' :
                                                        index === 2 ? 'bg-amber-50 text-amber-700' :
                                                            'text-slate-400'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <span className="text-xl">{entry.rank_emoji}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#AD03DE] flex items-center justify-center text-white font-serif font-black">
                                                    {entry.name.charAt(0)}
                                                </div>
                                                <span className="text-lg font-bold text-slate-900 group-hover:text-[#AD03DE] transition-colors font-serif">
                                                    {entry.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-[#AD03DE] font-black rounded-xl border border-purple-100">
                                                <TrendingUp className="w-4 h-4" />
                                                {entry.conversions}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-black rounded-xl border border-rose-100">
                                                <Target className="w-4 h-4" />
                                                {entry.hot_leads}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="w-full max-w-[100px] mx-auto">
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                    <span>Rate</span>
                                                    <span>{efficiency}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#AD03DE] to-purple-400 rounded-full"
                                                        style={{ width: `${efficiency}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-black text-slate-900 font-serif">{entry.total_leads}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Managed Leads</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Insight */}
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-slate-600 font-bold">
                        <Users className="w-5 h-5 text-[#AD03DE]" />
                        <p className="text-sm">
                            Counselor rankings are updated in real-time based on successful lead conversions and management of high-priority student profiles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
