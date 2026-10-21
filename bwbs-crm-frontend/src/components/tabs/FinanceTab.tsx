import { useQuery } from '@tanstack/react-query';
import { getClaims, commissionStatusColors } from '../../services/finance';

const FinanceTab = ({ studentId }: { studentId: string }) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['claims', studentId],
        queryFn: () => getClaims({ student: studentId }),
    });

    const claims = data?.results || [];
    const claim = claims.length > 0 ? claims[0] : null;

    const formatCurrency = (amount: number, currency = 'GBP') => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-slate-50 rounded-2xl border border-border" />
                <div className="h-64 bg-slate-50 rounded-2xl border border-border" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-center bg-rose-50/30 border border-rose-100 rounded-2xl">
                <p className="text-rose-500 font-bold text-xs">Couldn't load finance</p>
                <p className="text-rose-400 text-sm mt-1">Something went wrong. Please try again.</p>
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-8 border border-slate-200 text-[#7c3aed] group transition-all duration-200">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No commission yet. It appears once the student enrolls.</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                    Financial yields have not yet been initialized. This ledger will activate once the scholar's enrollment is finalized through our institutional partners.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header Section */}
            <div className="mb-8">
                <h3 className="text-3xl font-bold text-slate-900">Finance</h3>
                <p className="text-xs text-slate-500 mt-2">Commission for this student</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative group">
                {/* Premium Background Artifact */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#7c3aed]/10 to-indigo-500/10 blur-[100px] rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"></div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <p className="text-xs text-slate-500 mb-2 pl-1">Expected commission</p>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {formatCurrency(claim.expected_amount, claim.currency)}
                            </h2>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[11px] font-bold text-slate-300 mr-2">Status</span>
                            <span className={`px-5 py-2 rounded-2xl text-xs font-bold border shadow-sm ${commissionStatusColors[claim.status]}`}>
                                {claim.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* University Detail */}
                        <div className="group/item flex items-center gap-5 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-[#7c3aed]/10 transition-all duration-200">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 transition-transform">
                                <svg className="w-7 h-7 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M4 18V9l8-4 8 4v9M9 21v-6h6v6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500 mb-1">University</p>
                                <p className="text-base font-bold text-slate-900 leading-tight"> {claim.application_details?.university_name_display || 'Institutional Partner'}</p>
                            </div>
                        </div>

                        {/* Course Detail */}
                        <div className="group/item flex items-center gap-5 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:border-[#7c3aed]/10 transition-all duration-200">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200 transition-transform">
                                <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-500 mb-1">Course</p>
                                <p className="text-base font-bold text-slate-900 leading-tight"> {claim.application_details?.course_name_display || 'Standard Program'}</p>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-4">
                            <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-50">
                                <p className="text-[11px] font-bold text-slate-300 mb-2">Invoiced</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <p className="text-sm text-slate-600 font-bold">{claim.invoice_date || 'Pending'}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-50">
                                <p className="text-[11px] font-bold text-slate-300 mb-2">Paid</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                    <p className="text-sm text-slate-600 font-bold">{claim.payment_received_date || 'Expected TBC'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes (if any) */}
                {claim.notes && (
                    <div className="px-6 py-8 bg-slate-50/50 border-t border-slate-100 font-bold transition-all hover:bg-slate-50 group-hover:px-12 duration-200">
                        <div className="flex gap-4">
                            <span className="text-2xl text-slate-200 leading-none">“</span>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {claim.notes}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Action Artifact */}
            <div className="mt-8 flex justify-end">
                <button className="inline-flex items-center gap-3 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm group">
                    <svg className="w-4 h-4 text-[#7c3aed] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </button>
            </div>
        </div>
    );
};

export default FinanceTab;
