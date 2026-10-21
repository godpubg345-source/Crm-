import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Plus } from 'lucide-react';
import clsx from 'clsx';
import { getBranchFinanceSummary } from '../../../../services/branches';
import type { BranchFinanceSummary } from '../../../../services/branches';
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
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Finance</h2>
                    <p className="text-xs text-slate-500 mt-2">Revenue, payroll and commissions for this branch</p>
                </div>
                <button
                    onClick={onRecordTransaction}
                    className="px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Record Transaction
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Staff Payroll Ledger */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h4 className="text-[11px] font-semibold text-slate-900">Payroll</h4>
                                <p className="text-[11px] text-slate-500 mt-1">This month's salary payments</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Team Member</th>
                                        <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Base Salary</th>
                                        <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">YTD Earnings</th>
                                        <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Incentives</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff?.map(member => (
                                        <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 leading-none">{member.first_name} {member.last_name}</p>
                                                        <p className="text-[11px] text-slate-500 mt-1">{member.role_display}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-semibold text-slate-900">
                                                {formatCurrency(Number(member.dossier?.base_salary || 0), member.dossier?.currency)}
                                            </td>
                                            <td className="px-6 py-6 font-semibold text-slate-600">
                                                {formatCurrency(Number(member.performance?.revenue_generated || 0))}
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-semibold">
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
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-[11px] font-semibold text-slate-900">Recent commission claims</h4>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {financeSummary?.recent_claims?.length ? financeSummary.recent_claims.map((claim: any) => (
                                <div key={claim.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
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
                                            <p className="font-semibold text-slate-900">{claim.university}</p>
                                            <p className="text-[11px] text-slate-500 mt-1">Claim Ref: #{claim.id.split('-')[0]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">{formatCurrency(claim.expected_amount, financeSummary.currency)}</p>
                                        <p className={clsx(
                                            "text-[11px] font-semibold mt-1",
                                            claim.status === 'RECEIVED' ? "text-emerald-500" : "text-slate-400"
                                        )}>{claim.status_display}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-300 text-sm">No claims this month</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden group">
                        <TrendingUp className="absolute top-0 right-0 w-32 h-32 text-emerald-500/10 -rotate-12 translate-x-4 -translate-y-4 transition-transform duration-200" />
                        <h4 className="text-[11px] font-semibold text-[#7c3aed] mb-6">Estimated revenue</h4>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="text-3xl font-semibold tracking-tight">
                                {formatCurrency(financeSummary?.total_revenue_estimate || 0, financeSummary?.currency)}
                            </div>
                            <span className="text-xs font-semibold text-emerald-400">Per Month</span>
                        </div>
                        <div className="h-px bg-white/10 w-full mb-6" />
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Staff cost</p>
                                    <p className="text-2xl font-semibold">{formatCurrency(financeSummary?.total_payroll_monthly || 0, financeSummary?.currency)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Efficiency</p>
                                    <p className="text-2xl font-semibold text-emerald-400">{efficiency !== null ? `${efficiency}%` : '—'}</p>
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
