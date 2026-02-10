import { Download } from 'lucide-react';
import { exportBranchAnalytics } from '../../../services/branches';
import type { BranchAnalytics } from '../../../services/branches';
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
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Intelligence & Reporting</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Data exports • Performance audits • Analytics suites</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#AD03DE] transition-all flex items-center gap-3"
                >
                    <Download className="w-4 h-4" />
                    Export Complete Suite
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Lead Acquisition Trends</h4>
                    <div className="h-64 flex items-end gap-2">
                        {analytics?.lead_trends?.length ? analytics.lead_trends.map((t: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div
                                    className="w-full bg-slate-900 rounded-t-xl hover:bg-[#AD03DE] transition-colors relative group"
                                    style={{ height: `${(t.count / 100) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {t.count} Leads
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-slate-400 uppercase rotate-45 origin-left truncate w-12">{t.month}</span>
                            </div>
                        )) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-[2rem] text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                Insufficient data for visualization
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-12">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Revenue Alpha Yield</h4>
                    <div className="space-y-8">
                        {analytics?.revenue_breakdown?.length ? analytics.revenue_breakdown.map((item: any, i: number) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.type}</p>
                                    <p className="text-xl font-serif font-black text-slate-900">£{item.total.toLocaleString()}</p>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                                    <div
                                        className="h-full bg-slate-900 rounded-full hover:bg-[#AD03DE] transition-all duration-1000"
                                        style={{ width: `${(item.total / (analytics?.revenue_estimate || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Financial breakdown pending cache sync</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
