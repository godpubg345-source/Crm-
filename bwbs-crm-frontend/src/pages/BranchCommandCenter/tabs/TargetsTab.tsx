import { useQuery } from '@tanstack/react-query';
import { Plus, Target } from 'lucide-react';
import clsx from 'clsx';
import { getBranchTargets } from '../../../services/branches';
import type { BranchTarget } from '../../../services/branches';
import type { TargetsTabProps } from '../types';

const TargetsTab = ({ branchId, analytics, onSetQuota }: TargetsTabProps) => {
    const { data: targets } = useQuery<BranchTarget[]>({
        queryKey: ['branch-targets', branchId],
        queryFn: () => getBranchTargets(branchId)
    });

    const activeTarget = targets?.[0]; // Get most recent target

    const metrics = [
        { label: 'Lead Volume', current: analytics?.total_leads || 0, target: activeTarget?.target_leads || 0, unit: 'Leads' },
        { label: 'Enrollments', current: analytics?.active_students || 0, target: activeTarget?.target_enrollments || 0, unit: 'Students' },
        { label: 'Revenue Yield', current: analytics?.revenue_estimate || 0, target: activeTarget?.target_revenue || 0, unit: '£', isCurrency: true }
    ];

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Performance Targets</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Achievement vs. Goal • Monthly quotas • Precision tracking</p>
                </div>
                <button
                    onClick={onSetQuota}
                    className="px-10 py-4 bg-[#AD03DE] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Set New Quota
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {metrics.map((metric, i) => {
                    const progress = metric.target > 0 ? (metric.current / metric.target) * 100 : 0;
                    return (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 group hover:border-[#AD03DE]/20 transition-all">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{metric.label}</h4>
                                <span className={clsx(
                                    "text-[10px] font-black px-3 py-1 rounded-full",
                                    progress >= 100 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                )}>
                                    {Math.round(progress)}%
                                </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-serif font-black text-slate-900">
                                    {metric.isCurrency ? `£${metric.current.toLocaleString()}` : metric.current}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase">/ {metric.isCurrency ? `£${metric.target.toLocaleString()}` : metric.target} {metric.unit}</span>
                            </div>

                            <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                <div
                                    className={clsx(
                                        "h-full transition-all duration-1000",
                                        progress >= 100 ? "bg-emerald-500" : "bg-[#AD03DE]"
                                    )}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                                {progress > 100 && (
                                    <div
                                        className="absolute top-0 right-0 h-full bg-emerald-400/30 animate-pulse"
                                        style={{ width: `${progress - 100}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-8 -translate-y-8">
                    <Target className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-3xl font-serif font-black mb-4">Strategic Alignment</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                            Branch targets are calculated based on historical performance, staffing levels, and regional market trends. Achievement above 110% triggers automatic performance bonuses for the leadership node.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Streak</p>
                            <p className="text-3xl font-serif font-black">4 Mo</p>
                        </div>
                        <div className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Regional Rank</p>
                            <p className="text-3xl font-serif font-black">#2</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TargetsTab;
