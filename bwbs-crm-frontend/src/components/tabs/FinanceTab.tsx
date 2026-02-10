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
                <div className="h-48 bg-slate-50 rounded-[2.5rem] border border-border" />
                <div className="h-64 bg-slate-50 rounded-[2.5rem] border border-border" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center bg-rose-50/30 border border-rose-100 rounded-[2.5rem]">
                <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px]">Financial Protocol Fault</p>
                <p className="text-rose-400 text-sm mt-1">Unable to synchronize commission ledger.</p>
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 border border-slate-100 text-[#AD03DE] shadow-xl group hover:rotate-12 transition-all duration-700">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Dossier Awaiting Enrollment</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                    Financial yields have not yet been initialized. This ledger will activate once the scholar's enrollment is finalized through our institutional partners.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="mb-8">
                <h3 className="text-3xl font-serif font-bold text-slate-900">Financial Ledger</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Commission Artifact & Settlement Tracker</p>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative group">
                {/* Premium Background Artifact */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#AD03DE]/10 to-indigo-500/10 blur-[100px] rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="p-10 relative z-10">
                    <div className="flex justify-between items-start mb-12">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2 pl-1">Projected Yield</p>
                            <h2 className="text-6xl font-serif font-bold text-slate-900 tracking-tighter">
                                {formatCurrency(claim.expected_amount, claim.currency)}
                            </h2>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mr-2">Settlement State</span>
                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] border shadow-sm ${commissionStatusColors[claim.status]}`}>
                                {claim.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* University Detail */}
                        <div className="group/item flex items-center gap-5 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:border-[#AD03DE]/10 transition-all duration-500">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-50 group-hover/item:rotate-6 transition-transform">
                                <svg className="w-7 h-7 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M4 18V9l8-4 8 4v9M9 21v-6h6v6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Partner Institution</p>
                                <p className="text-base font-serif font-bold text-slate-900 leading-tight"> {claim.application_details?.university_name_display || 'Institutional Partner'}</p>
                            </div>
                        </div>

                        {/* Course Detail */}
                        <div className="group/item flex items-center gap-5 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:border-[#AD03DE]/10 transition-all duration-500">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 shadow-sm border border-slate-50 group-hover/item:rotate-6 transition-transform">
                                <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic Path</p>
                                <p className="text-base font-serif font-bold text-slate-900 leading-tight"> {claim.application_details?.course_name_display || 'Standard Program'}</p>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-4">
                            <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-50">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">Invoice Issuance</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <p className="text-sm text-slate-600 font-bold">{claim.invoice_date || 'Pending Induction'}</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50/30 rounded-2xl border border-slate-50">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-2">Fund Allocation</p>
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
                    <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 font-bold transition-all hover:bg-slate-50 group-hover:px-12 duration-500">
                        <div className="flex gap-4">
                            <span className="text-2xl text-slate-200 font-serif leading-none">“</span>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed tracking-wide">
                                {claim.notes}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Action Artifact */}
            <div className="mt-8 flex justify-end">
                <button className="inline-flex items-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95 group">
                    <svg className="w-4 h-4 text-[#AD03DE] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Financial Artifact
                </button>
            </div>
        </div>
    );
};

export default FinanceTab;
