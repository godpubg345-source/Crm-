import { Download } from 'lucide-react';
import { exportBranchAnalytics } from '../../../../services/branches';
import type { BranchAnalytics } from '../../../../services/branches';
import type { ReportsTabProps } from '../types';

const ReportsTab = ({ branchId, analytics }: ReportsTabProps) => {
    const handleExport = async () => {
        try {
            const blob = await exportBranchAnalytics(branchId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `branch-report-${branchId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate export package');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Reports</h2>
                    <p className="text-xs text-slate-500 mt-2">Download branch reports</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold hover:bg-[#7c3aed] transition-all flex items-center gap-3"
                >
                    <Download className="w-4 h-4" />
                    Export all
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-[11px] font-semibold text-slate-900">Lead Acquisition Trends</h4>
                    <div className="h-64 flex items-end gap-2">
                        {analytics?.lead_trends?.length ? analytics.lead_trends.map((t: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div
                                    className="w-full bg-slate-900 rounded-t-xl hover:bg-[#7c3aed] transition-colors relative group"
                                    style={{ height: `${(t.count / 100) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {t.count} Leads
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400 rotate-45 origin-left truncate w-12">{t.month}</span>
                            </div>
                        )) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl text-[11px] font-semibold text-slate-300">
                                Not enough data yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-[11px] font-semibold text-slate-900">Revenue</h4>
                    <div className="space-y-8">
                        {analytics?.revenue_breakdown?.length ? analytics.revenue_breakdown.map((item: any, i: number) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-semibold text-slate-900">{item.type}</p>
                                    <p className="text-xl font-semibold text-slate-900">£{item.total.toLocaleString()}</p>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                                    <div
                                        className="h-full bg-slate-900 rounded-full hover:bg-[#7c3aed] transition-all duration-200"
                                        style={{ width: `${(item.total / (analytics?.revenue_estimate || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 text-center">
                                <span className="text-[11px] font-semibold text-slate-300">No revenue data yet</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
