import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { empGetLeaderboard, empGetMyProfile } from '../../services/empPortal';
import { Trophy, Loader2, Medal, Star, TrendingUp, Crown } from 'lucide-react';
import clsx from 'clsx';

const EmpLeaderboard: React.FC = () => {
    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: empGetLeaderboard,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    const topThree = leaderboard?.slice(0, 3) || [];
    const rest = leaderboard?.slice(3) || [];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Leaderboard</h1>
                <p className="text-slate-500 font-medium">Performance rankings across the company.</p>
            </div>

            {/* Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topThree.map((user: any, index: number) => {
                        const isMe = user.id === profile?.id;
                        const medals = [
                            { bg: 'from-amber-400 to-yellow-500', ring: 'ring-amber-100', icon: Crown },
                            { bg: 'from-slate-300 to-slate-400', ring: 'ring-slate-100', icon: Medal },
                            { bg: 'from-amber-600 to-amber-700', ring: 'ring-amber-50', icon: Medal },
                        ];
                        const medal = medals[index];
                        const Icon = medal.icon;
                        return (
                            <div key={user.id} className={clsx(
                                "rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-sm transition-all",
                                isMe ? "bg-teal-600 text-white shadow-xl shadow-teal-200/40" : "bg-white border border-slate-100"
                            )}>
                                {isMe && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />}
                                <div className={clsx(
                                    "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-lg font-black shadow-lg mb-4",
                                    medal.bg
                                )}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <p className="text-2xl font-black font-serif mb-1">#{index + 1}</p>
                                <h3 className={clsx("font-black text-lg", isMe ? "text-white" : "text-slate-900")}>{user.first_name} {user.last_name}</h3>
                                <p className={clsx("text-xs font-bold uppercase tracking-widest mb-4", isMe ? "text-teal-100" : "text-slate-400")}>{user.role_display || 'Staff'}</p>
                                <div className={clsx("rounded-2xl p-4", isMe ? "bg-white/10" : "bg-slate-50")}>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Star className={clsx("w-4 h-4", isMe ? "text-amber-300" : "text-amber-500")} />
                                        <span className="font-black text-xl font-serif">{user.performance?.points || 0}</span>
                                    </div>
                                    <p className={clsx("text-[10px] font-black uppercase tracking-widest", isMe ? "text-teal-100" : "text-slate-400")}>Points</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16">Rank</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Points</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Level</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {rest.map((user: any, index: number) => {
                                    const isMe = user.id === profile?.id;
                                    return (
                                        <tr key={user.id} className={clsx(
                                            "border-b border-slate-50 transition-colors",
                                            isMe ? "bg-teal-50/50" : "hover:bg-slate-50/50"
                                        )}>
                                            <td className="p-5 font-black text-slate-400">{index + 4}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black",
                                                        isMe ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                                    </div>
                                                    <span className={clsx("font-bold", isMe ? "text-teal-700" : "text-slate-900")}>
                                                        {user.first_name} {user.last_name} {isMe && '(You)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-500 font-medium">{user.role_display || 'Staff'}</td>
                                            <td className="p-5 text-right font-black text-slate-900">{user.performance?.points || 0}</td>
                                            <td className="p-5 text-right">
                                                <span className="inline-flex items-center gap-1 text-teal-600 font-black">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    {user.performance?.level || 1}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {leaderboard?.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">Leaderboard Empty</h3>
                    <p className="text-sm text-slate-500 font-medium">Performance data will populate the leaderboard.</p>
                </div>
            )}
        </div>
    );
};

export default EmpLeaderboard;
