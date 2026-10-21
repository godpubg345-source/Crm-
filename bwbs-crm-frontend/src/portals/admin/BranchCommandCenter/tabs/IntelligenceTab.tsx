import { useQuery } from '@tanstack/react-query';
import { Zap, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { getPredictiveStaffing } from '../../../../services/branches';
import type { PredictiveStaffing } from '../../../../services/branches';
import type { TabProps } from '../types';

const IntelligenceTab = ({ branchId }: TabProps) => {
    const { data: predictive } = useQuery<PredictiveStaffing>({
        queryKey: ['branch-predictive', branchId],
        queryFn: () => getPredictiveStaffing(branchId)
    });

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Forecast</h2>
                <p className="text-xs text-slate-500 mt-2">Expected leads and staffing needs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Zap className="w-64 h-64 text-[#7c3aed]" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Zap className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-semibold text-slate-900 tracking-tight">Staffing</h4>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Based on recent leads and conversions</p>
                            </div>
                        </div>

                        {predictive ? (
                            <div className={clsx(
                                "p-6 rounded-2xl border-2 transition-all duration-1000",
                                predictive.status === 'CRITICAL' ? "bg-rose-50 border-rose-100 text-rose-700 shadow-sm " :
                                    predictive.status === 'WARNING' ? "bg-amber-50 border-amber-100 text-amber-700 shadow-sm " :
                                        "bg-emerald-50 border-emerald-100 text-emerald-700"
                            )}>
                                <h5 className="text-3xl font-semibold mb-6 leading-tight">{predictive.recommendation}</h5>
                                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-current/10">
                                    <div className="group">
                                        <p className="text-[11px] font-semibold opacity-60 mb-2">Per day</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-3xl font-semibold">{predictive.daily_velocity}</p>
                                            <span className="text-xs font-bold opacity-60">Leads/Day</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-current/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-current opacity-50 w-[60%] rounded-full group-hover:w-[70%] transition-all duration-200" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <p className="text-[11px] font-semibold opacity-60 mb-2">Leads per staff</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-3xl font-semibold">{predictive.leads_per_staff_monthly}</p>
                                            <span className="text-xs font-bold opacity-60">Leads/Staff</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-current/10 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-current opacity-50 w-[40%] rounded-full group-hover:w-[50%] transition-all duration-200" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold opacity-60 mb-2">Status</p>
                                        <span className={clsx(
                                            "inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-white/60 shadow-sm ",
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
                            <div className="h-64 rounded-2xl bg-slate-50 animate-pulse flex items-center justify-center">
                                <span className="text-xs font-semibold text-slate-300">Calculating forecast...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden group">
                        <TrendingUp className="absolute top-0 right-0 w-32 h-32 text-indigo-500/10 -rotate-12 translate-x-4 -translate-y-4 transition-transform duration-200" />
                        <h4 className="text-[11px] font-semibold text-[#7c3aed] mb-6">Next 14 days</h4>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="text-3xl font-semibold tracking-tight">+{predictive?.projected_load_14d || 0}</div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-emerald-400">Incoming Leads</span>
                                <span className="text-xs font-bold text-slate-500">Pipeline</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">"High volume predicted. Ensure all counselors have updated availability in the booking engine."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceTab;
