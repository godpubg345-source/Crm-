import { useQuery } from '@tanstack/react-query';
import { Zap, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { getPredictiveStaffing } from '../../../services/branches';
import type { PredictiveStaffing } from '../../../services/branches';
import type { TabProps } from '../types';

const IntelligenceTab = ({ branchId }: TabProps) => {
    const { data: predictive } = useQuery<PredictiveStaffing>({
        queryKey: ['branch-predictive', branchId],
        queryFn: () => getPredictiveStaffing(branchId)
    });

    return (
        <div className="space-y-12 pb-20">
            <div>
                <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Intelligence Forecast</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Predictive analytics • Data-driven scaling • Growth modeling</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Zap className="w-64 h-64 text-[#AD03DE]" />
                    </div>

                    <div className="relative z-10 space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Staffing Recommendations</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Based on current lead velocity & conversion trends</p>
                            </div>
                        </div>

                        {predictive ? (
                            <div className={clsx(
                                "p-10 rounded-[3rem] border-2 transition-all duration-1000",
                                predictive.status === 'CRITICAL' ? "bg-rose-50 border-rose-100 text-rose-700 shadow-2xl shadow-rose-200/20" :
                                    predictive.status === 'WARNING' ? "bg-amber-50 border-amber-100 text-amber-700 shadow-2xl shadow-amber-200/20" :
                                        "bg-emerald-50 border-emerald-100 text-emerald-700"
                            )}>
                                <h5 className="text-3xl font-serif font-black mb-6 leading-tight">{predictive.recommendation}</h5>
                                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-current/10">
                                    <div className="group">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Daily velocity</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-3xl font-serif font-black">{predictive.daily_velocity}</p>
                                            <span className="text-xs font-bold opacity-60">Leads/Day</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-current/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-current opacity-50 w-[60%] rounded-full group-hover:w-[70%] transition-all duration-1000" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Staff Load</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-3xl font-serif font-black">{predictive.leads_per_staff_monthly}</p>
                                            <span className="text-xs font-bold opacity-60">Leads/Staff</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-current/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-current opacity-50 w-[40%] rounded-full group-hover:w-[50%] transition-all duration-1000" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Node Status</p>
                                        <span className={clsx(
                                            "inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm",
                                            predictive.status === 'CRITICAL' ? "text-rose-600" :
                                                predictive.status === 'WARNING' ? "text-amber-600" :
                                                    "text-emerald-600"
                                        )}>
                                            {predictive.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 rounded-[3rem] bg-slate-50 animate-pulse flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Engaging Predictive Engine...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                        <TrendingUp className="absolute top-0 right-0 w-32 h-32 text-indigo-500/10 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-1000" />
                        <h4 className="text-[11px] font-black text-[#AD03DE] uppercase tracking-[0.3em] mb-12">Next 14 Days Forecast</h4>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-7xl font-serif font-black tracking-tighter">+{predictive?.projected_load_14d || 0}</div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black text-emerald-400">Incoming Leads</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Regional Pipeline</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed font-serif italic">"High volume predicted. Ensure all counselors have updated availability in the booking engine."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceTab;
