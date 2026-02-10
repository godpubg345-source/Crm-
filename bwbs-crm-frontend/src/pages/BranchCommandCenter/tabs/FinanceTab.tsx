import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Plus } from 'lucide-react';
import clsx from 'clsx';
import { getBranchFinanceSummary } from '../../../services/branches';
import type { BranchFinanceSummary } from '../../../services/branches';
import type { FinanceTabProps } from '../types';

const FinanceTab = ({ branchId, staff, onRecordTransaction }: FinanceTabProps) => {
    const { data: financeSummary, isLoading } = useQuery<BranchFinanceSummary>({
        queryKey: ['branch-finance', branchId],
        queryFn: () => getBranchFinanceSummary(branchId)
    });

    const formatCurrency = (amount: number, currency: string = 'GBP') => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const efficiency =
        financeSummary && Number(financeSummary.total_payroll_monthly) > 0
            ? Math.round((Number(financeSummary.total_revenue_estimate) / Number(financeSummary.total_payroll_monthly)) * 100)
            : null;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Financial Command</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Revenue streams - Payroll ledger - Commission tracking</p>
                </div>
                <button
                    onClick={onRecordTransaction}
                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Record Transaction
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Staff Payroll Ledger */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Active Personnel Payroll</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly disbursement status</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Salary</th>
                                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">YTD Earnings</th>
                                        <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Incentives</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff?.map(member => (
                                        <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-serif font-black text-slate-900 leading-none">{member.first_name} {member.last_name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{member.role_display}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 font-serif font-black text-slate-900">
                                                {formatCurrency(Number(member.dossier?.base_salary || 0), member.dossier?.currency)}
                                            </td>
                                            <td className="px-10 py-6 font-serif font-black text-slate-600">
                                                {formatCurrency(Number(member.performance?.revenue_generated || 0))}
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">
                                                    {member.performance?.points || 0} XP
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Commission Claims */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recent Commission Claims</h4>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {financeSummary?.recent_claims?.length ? financeSummary.recent_claims.map((claim: any) => (
                                <div key={claim.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                            claim.status === 'RECEIVED' ? "bg-emerald-50 text-emerald-600" :
                                                claim.status === 'INVOICED' ? "bg-indigo-400/10 text-indigo-400" :
                                                    "bg-slate-50 text-slate-400"
                                        )}>
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-serif font-black text-slate-900">{claim.university}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Claim Ref: #{claim.id.split('-')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-serif font-black text-slate-900">{formatCurrency(claim.expected_amount, financeSummary.currency)}</p>
                                        <p className={clsx(
                                            "text-[9px] font-black uppercase tracking-widest mt-1",
                                            claim.status === 'RECEIVED' ? "text-emerald-500" : "text-slate-400"
                                        )}>{claim.status_display}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-300 font-serif italic text-sm">No recent claims recorded in this cycle</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                        <TrendingUp className="absolute top-0 right-0 w-32 h-32 text-emerald-500/10 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-1000" />
                        <h4 className="text-[11px] font-black text-[#AD03DE] uppercase tracking-[0.3em] mb-12">Total Yield Estimate</h4>
                        <div className="flex items-center gap-6 mb-12">
                            <div className="text-5xl font-serif font-black tracking-tighter">
                                {formatCurrency(financeSummary?.total_revenue_estimate || 0, financeSummary?.currency)}
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Per Month</span>
                        </div>
                        <div className="h-px bg-white/10 w-full mb-12" />
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Personnel Cost</p>
                                    <p className="text-2xl font-serif font-black">{formatCurrency(financeSummary?.total_payroll_monthly || 0, financeSummary?.currency)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Efficiency</p>
                                    <p className="text-2xl font-serif font-black text-emerald-400">{efficiency !== null ? `${efficiency}%` : '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceTab;
