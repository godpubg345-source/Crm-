import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { empGetPayrollReport, empGetMyProfile } from '../../services/empPortal';
import { BadgeDollarSign, Download, Loader2, FileText, CalendarCheck } from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';

const EmpPayroll: React.FC = () => {
    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const { data: payroll, isLoading } = useQuery({
        queryKey: ['myPayroll', profile?.id],
        queryFn: () => empGetPayrollReport(profile!.id),
        enabled: !!profile?.id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Payroll & Payslips</h1>
                    <p className="text-slate-500 font-medium">View your recent salary payouts and download your payslips.</p>
                </div>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl" />
                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-2">Total Gross (YTD)</p>
                        <h2 className="text-3xl font-black font-serif">${Number(payroll?.summary?.total_gross || 0).toLocaleString()}</h2>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Net (YTD)</p>
                        <h2 className="text-3xl font-black font-serif text-slate-900">${Number(payroll?.summary?.total_net || 0).toLocaleString()}</h2>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Avg. Monthly</p>
                        <h2 className="text-3xl font-black font-serif text-slate-900">${Number(payroll?.summary?.avg_monthly || 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Payslips List */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 font-serif">Recent Payslips</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {payroll?.records?.map((record: any) => (
                        <div key={record.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:shadow-md hover:border-teal-100 transition-all group">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
                                <div>
                                    <h4 className="font-black text-lg text-slate-900 font-serif">{record.month_display}</h4>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <CalendarCheck className="w-3 h-3" />
                                        Paid: {record.payout_date ? format(parseISO(record.payout_date), 'MMM dd, yyyy') : 'Pending'}
                                    </p>
                                </div>
                                <span className={clsx(
                                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl",
                                    record.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                        record.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' :
                                            'bg-amber-100 text-amber-700'
                                )}>
                                    {record.status_display}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-500">Base Salary</span>
                                    <span className="font-black text-slate-900">${Number(record.base_salary_snapshot).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-emerald-600">Incentives</span>
                                    <span className="font-black text-emerald-700">+${Number(record.incentive_total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-200/60 pb-3">
                                    <span className="font-bold text-rose-500">Deductions</span>
                                    <span className="font-black text-rose-600">-${(Number(record.tax_deductions) + Number(record.other_deductions)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base pt-1">
                                    <span className="font-black text-slate-900">Net Pay</span>
                                    <span className="font-black text-teal-600 font-serif">${Number(record.net_payout).toLocaleString()}</span>
                                </div>
                            </div>

                            {record.payslip_pdf ? (
                                <a
                                    href={record.payslip_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-teal-500 hover:text-teal-600 transition-colors group-hover:shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full h-12 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    PDF Unavailable
                                </button>
                            )}
                        </div>
                    ))}

                    {(!payroll?.records || payroll.records.length === 0) && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
                            <BadgeDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-slate-900 font-serif mb-1">No Payroll Records</h4>
                            <p className="text-sm font-medium text-slate-500">You don't have any generated payslips yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmpPayroll;
