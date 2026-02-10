import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClaims,
    updateClaimStatus,
    downloadCommissionInvoice,
    getCommissionStats,
    type CommissionStatus,
    type CommissionFilterParams
} from '../services/finance';
import { getUniversities } from '../services/universities';
import {
    TrendingUp,
    ShieldCheck,
    Clock,
    Download,
    Calendar,
    X,
    Loader2,
    FileText,
    Building,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// FINANCE DASHBOARD - CAPITAL MANAGEMENT COMMAND
// ============================================================================

const FinanceDashboard = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<CommissionFilterParams>({
        page: 1,
        status: '',
        university: '',
    });

    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
    const [modalAction, setModalAction] = useState<'INVOICED' | 'RECEIVED' | null>(null);
    const [actionDate, setActionDate] = useState(new Date().toISOString().split('T')[0]);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Fetch Claims
    const { data, isLoading } = useQuery({
        queryKey: ['claims', filters],
        queryFn: () => getClaims(filters),
    });

    // Fetch Stats
    const { data: stats } = useQuery({
        queryKey: ['commission-stats'],
        queryFn: () => getCommissionStats(),
    });

    // Fetch Universities for filter
    const { data: universities } = useQuery({
        queryKey: ['universities'],
        queryFn: () => getUniversities(),
    });

    // Mutations
    const statusMutation = useMutation({
        mutationFn: ({ id, status, date }: { id: string; status: CommissionStatus; date?: string }) =>
            updateClaimStatus(id, status, date),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            queryClient.invalidateQueries({ queryKey: ['commission-stats'] });
            closeModal();
        },
    });

    const handleAction = (id: string, action: 'INVOICED' | 'RECEIVED') => {
        setSelectedClaimId(id);
        setModalAction(action);
        setIsDateModalOpen(true);
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            setDownloadingId(id);
            const blob = await downloadCommissionInvoice(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${fileName}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download invoice:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const confirmAction = () => {
        if (selectedClaimId && modalAction) {
            statusMutation.mutate({ id: selectedClaimId, status: modalAction, date: actionDate });
        }
    };

    const closeModal = () => {
        setIsDateModalOpen(false);
        setSelectedClaimId(null);
        setModalAction(null);
        setActionDate(new Date().toISOString().split('T')[0]);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const claims = data?.results || [];
    const projectedRevenue = stats?.projected_revenue || 0;
    const realizedRevenue = stats?.realized_revenue || 0;
    const pendingInvoicesCount = stats?.pending_invoices || 0;

    if (isLoading && !data) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.4em]">Archiving Financial Intelligence</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-[#6a0288] rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-extrabold text-slate-900 tracking-tight leading-none">Financial Intelligence</h1>
                    </div>
                    <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.5em] ml-6">Revenue surveillance • Institutional commission ledger</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <Building className="w-4 h-4 text-slate-300" />
                        <select
                            value={filters.university || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value, page: 1 }))}
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-800 focus:ring-0 cursor-pointer uppercase tracking-widest min-w-[180px]"
                        >
                            <option value="">All Institutional Partners</option>
                            {(universities?.results || []).map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-1" />
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="bg-white px-5 py-2.5 text-[10px] font-bold text-slate-900 uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
                    >
                        <option value="">All Protocol Statuses</option>
                        <option value="PENDING">Pending Recognition</option>
                        <option value="INVOICED">Invoiced Claims</option>
                        <option value="RECEIVED">Realized Assets</option>
                    </select>
                </div>
            </div>

            {/* High-Fidelity KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Projected Revenue */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/5 transition-colors duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#AD03DE] transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em]">Projected Revenue</p>
                        </div>
                        <p className="text-4xl font-serif font-extrabold text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{formatCurrency(projectedRevenue, 'GBP')}</p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest">Aggregate Claims</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-100" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Realized Assets */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.2em]">Realized Assets</p>
                        </div>
                        <p className="text-4xl font-serif font-extrabold text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{formatCurrency(realizedRevenue, 'GBP')}</p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[9px] text-emerald-600/60 font-extrabold uppercase tracking-widest">Verified Liquidity</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-100" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Invoices */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#AD03DE]/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/10 transition-colors duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#AD03DE]/5 flex items-center justify-center text-[#AD03DE]">
                                <FileText className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-extrabold text-[#AD03DE] uppercase tracking-[0.2em]">Tactical Invoices</p>
                        </div>
                        <p className="text-4xl font-serif font-extrabold text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{pendingInvoicesCount} <span className="text-sm font-sans text-slate-900 font-extrabold uppercase tracking-widest ml-2">Claims</span></p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[9px] text-[#AD03DE]/60 font-extrabold uppercase tracking-widest">Pending Reconciliation</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#AD03DE]/20" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institutional Ledger */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#AD03DE]" />
                    </div>
                )}

                <div className="premium-scrollbar overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">Partner Institution</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">Scholar & Protocol</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">Asset Value</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">Recognition Status</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100">Chronology</th>
                                <th className="px-10 py-8 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] border-b border-slate-100 text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-100 text-[#AD03DE] shadow-sm group-hover:scale-110 transition-all">
                                                <Building className="w-5 h-5" />
                                            </div>
                                            <span className="text-base font-serif font-extrabold text-slate-900 group-hover:text-[#AD03DE] transition-colors duration-500">{claim.university_details?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-extrabold text-slate-900 leading-tight mb-1">{claim.application_details?.student_name}</p>
                                        <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest line-clamp-1">{claim.application_details?.course_name}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                                            <span className="text-sm font-mono font-extrabold text-white tracking-widest">{formatCurrency(claim.expected_amount, claim.currency)}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={clsx(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm transition-all duration-500",
                                            claim.status === 'PENDING' ? "bg-slate-50 text-slate-400 border-slate-100" :
                                                claim.status === 'INVOICED' ? "bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-blue-500 group-hover:text-white" :
                                                    "bg-emerald-50 text-emerald-500 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white"
                                        )}>
                                            <div className={clsx(
                                                "w-1.5 h-1.5 rounded-full",
                                                claim.status === 'PENDING' ? "bg-slate-300" :
                                                    claim.status === 'INVOICED' ? "bg-blue-400 group-hover:bg-white" :
                                                        "bg-emerald-400 group-hover:bg-white"
                                            )} />
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="space-y-2">
                                            {claim.invoice_date && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tabular-nums">INV: {claim.invoice_date}</span>
                                                </div>
                                            )}
                                            {claim.payment_received_date && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tabular-nums">REC: {claim.payment_received_date}</span>
                                                </div>
                                            )}
                                            {!claim.invoice_date && !claim.payment_received_date && <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Awaiting Verification</span>}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {(claim.status === 'INVOICED' || claim.status === 'RECEIVED') && (
                                                <button
                                                    onClick={() => handleDownload(claim.id, claim.university_details?.name || 'Institutional')}
                                                    disabled={downloadingId === claim.id}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#AD03DE] hover:border-[#AD03DE]/30 transition-all active:scale-90 shadow-sm"
                                                    title="Download Institutional Invoice"
                                                >
                                                    {downloadingId === claim.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            {claim.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleAction(claim.id, 'INVOICED')}
                                                    className="px-6 py-3 bg-slate-900 border border-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-slate-200 active:scale-95"
                                                >
                                                    Invoice Claim
                                                </button>
                                            )}
                                            {claim.status === 'INVOICED' && (
                                                <button
                                                    onClick={() => handleAction(claim.id, 'RECEIVED')}
                                                    className="px-6 py-3 bg-emerald-500 border border-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-100 active:scale-95"
                                                >
                                                    Confirm Asset
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tactical Date Selection Modal */}
            {isDateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={closeModal} />
                    <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 p-12 border border-white">
                        <button
                            onClick={closeModal}
                            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-10 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#AD03DE] border border-slate-100 shadow-inner">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-serif font-extrabold text-slate-900 tracking-tight mb-1">
                                Protocol Synchronization
                            </h3>
                            <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">Mark as {modalAction === 'INVOICED' ? 'Invoiced' : 'Received'}</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1 text-center">
                                    Chronological Timestamp
                                </label>
                                <input
                                    type="date"
                                    value={actionDate}
                                    onChange={(e) => setActionDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono font-extrabold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all text-center"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-3">
                            <button
                                onClick={confirmAction}
                                disabled={statusMutation.isPending}
                                className="w-full py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-extrabold uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                {statusMutation.isPending ? 'Syncing Intelligence...' : 'Commit Protocol'}
                            </button>
                            <button onClick={closeModal} className="w-full py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Abstain</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
