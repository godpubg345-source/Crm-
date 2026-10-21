import { Users, Zap, Briefcase, Clock, BarChart3, TrendingUp } from 'lucide-react';
import KPICard from '../components/KPICard';
import type { OverviewTabProps } from '../types';

const OverviewTab = ({ branch, analytics, staff }: OverviewTabProps) => {
    const totalLeads = analytics?.total_leads || 0;
    const convertedLeads = analytics?.converted_leads || 0;
    const conversionTrend = totalLeads > 0 ? `${Math.round((convertedLeads / totalLeads) * 100)}% success` : 'No data';

    const maxTrendValue = Math.max(...(analytics?.lead_trends?.map((t: any) => t.count) || [1]), 1);

    return (
        <div className="space-y-6 pb-20 animate-reveal">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <KPICard label="Active Students" value={analytics?.active_students || 0} icon={Users} color="text-purple-600" trend={`${totalLeads} total leads`} />
                <KPICard label="Lead Conversion" value={`${analytics?.conversion_rate || 0}%`} icon={Zap} color="text-amber-500" trend={conversionTrend} />
                <KPICard label="Staff Count" value={staff?.length || 0} icon={Briefcase} color="text-indigo-500" trend={`${Math.round((totalLeads / (staff?.length || 1)))} leads/staff`} />
                <KPICard label="Status" value={branch.is_currently_open ? "ACTIVE" : "CLOSED"} icon={Clock} color={branch.is_currently_open ? "text-emerald-500" : "text-slate-400"} trend={branch.local_time} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-3xl font-semibold text-slate-800 tracking-tight">Lead Volume Trends</h3>
                                <p className="text-xs text-slate-500 mt-2">New leads per month, last 6 months</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-slate-200 group-hover:text-purple-500/20 transition-colors" />
                        </div>
                        <div className="h-64 flex items-end gap-5 px-4">
                            {analytics?.lead_trends?.length ? analytics.lead_trends.map((trend: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                    <div className="w-full bg-slate-100/30 rounded-t-2xl border border-slate-200/50 relative group/bar hover:bg-slate-100/50 transition-colors h-48">
                                        <div
                                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-2xl transition-all duration-200"
                                            style={{ height: `${(trend.count / maxTrendValue) * 100}%` }}
                                        />
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 opacity-0 group-hover/bar:opacity-100 transition-opacity">{trend.count}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500">{trend.month}</span>
                                </div>
                            )) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    No lead history data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between group overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 transition-transform border border-white/10">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight mb-4">Summary</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Branch <span className="text-white font-bold">{branch.name}</span> has
                            <span className="text-emerald-400 font-bold"> {totalLeads} leads</span> with
                            <span className="text-amber-400 font-bold"> {convertedLeads} converted</span>.
                            Currently managing <span className="text-indigo-400 font-bold">{analytics?.active_students || 0} active students</span>.
                        </p>
                    </div>
                    <button className="primary-glow-button w-full justify-center">Download report</button>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
