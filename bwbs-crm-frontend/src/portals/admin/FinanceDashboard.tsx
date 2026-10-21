import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClaims,
    updateClaimStatus,
    downloadCommissionInvoice,
    getCommissionStats,
    type CommissionStatus,
    type CommissionFilterParams
} from '../../services/finance';
import { getUniversities } from '../../services/universities';
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs font-semibold text-slate-600">Loading finance data...</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-6 animate-in fade-in duration-200 ease-out pe-6 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">Finance</h1>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 ml-6">Revenue and university commissions</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-200">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                        <Building className="w-4 h-4 text-slate-300" />
                        <select
                            value={filters.university || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value, page: 1 }))}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer min-w-[180px]"
                        >
                            <option value="">All universities</option>
                            {(universities?.results || []).map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-1" />
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                        className="bg-white px-5 py-2.5 text-xs font-bold text-slate-900 border-none focus:ring-0 cursor-pointer"
                    >
                        <option value="">All statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="INVOICED">Invoiced</option>
                        <option value="RECEIVED">Paid</option>
                    </select>
                </div>
            </div>

            {/* High-Fidelity KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Expected revenue */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-200 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#7c3aed]/5 transition-colors duration-200" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#7c3aed] transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-600">Expected revenue</p>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900 tracking-tight transition-transform">{formatCurrency(projectedRevenue, 'GBP')}</p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[11px] text-slate-600 font-semibold">Total claims</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-100" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paid */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-200 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors duration-200" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-emerald-600">Paid</p>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900 tracking-tight transition-transform">{formatCurrency(realizedRevenue, 'GBP')}</p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[11px] text-emerald-600/60 font-semibold">Received</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-100" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-200 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#7c3aed]/10 transition-colors duration-200" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/5 flex items-center justify-center text-[#7c3aed]">
                                <FileText className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-[#7c3aed]">Invoices</p>
                        </div>
                        <p className="text-3xl font-semibold text-slate-900 tracking-tight transition-transform">{pendingInvoicesCount} <span className="text-sm font-sans text-slate-900 font-semibold ml-2">Claims</span></p>
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                            <span className="text-[11px] text-[#7c3aed]/60 font-semibold">Awaiting payment</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]/20" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institutional Ledger */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#7c3aed]" />
                    </div>
                )}

                <div className="premium-scrollbar overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">University</th>
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">Student</th>
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">Amount</th>
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">Status</th>
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">Date</th>
                                <th className="px-6 py-8 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-[#7c3aed] transition-all">
                                                <Building className="w-5 h-5" />
                                            </div>
                                            <span className="text-base font-semibold text-slate-900 group-hover:text-[#7c3aed] transition-colors duration-200">{claim.university_details?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">{claim.application_details?.student_name}</p>
                                        <p className="text-xs font-semibold text-slate-600 line-clamp-1">{claim.application_details?.course_name}</p>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl shadow-sm">
                                            <span className="text-sm font-mono font-semibold text-white">{formatCurrency(claim.expected_amount, claim.currency)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className={clsx(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold border shadow-sm transition-all duration-500",
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
                                    <td className="px-6 py-8">
                                        <div className="space-y-2">
                                            {claim.invoice_date && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-blue-500" />
                                                    <span className="text-xs font-semibold text-slate-800 tabular-nums">INV: {claim.invoice_date}</span>
                                                </div>
                                            )}
                                            {claim.payment_received_date && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-xs font-semibold text-slate-800 tabular-nums">REC: {claim.payment_received_date}</span>
                                                </div>
                                            )}
                                            {!claim.invoice_date && !claim.payment_received_date && <span className="text-xs font-semibold text-slate-400">Awaiting check</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {(claim.status === 'INVOICED' || claim.status === 'RECEIVED') && (
                                                <button
                                                    onClick={() => handleDownload(claim.id, claim.university_details?.name || 'Institutional')}
                                                    disabled={downloadingId === claim.id}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-300 hover:text-[#7c3aed] hover:border-[#7c3aed]/30 transition-all"
                                                    title="Download invoice"
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
                                                    className="px-4 py-2.5 bg-slate-900 border border-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-all shadow-sm"
                                                >
                                                    Send invoice
                                                </button>
                                            )}
                                            {claim.status === 'INVOICED' && (
                                                <button
                                                    onClick={() => handleAction(claim.id, 'RECEIVED')}
                                                    className="px-6 py-3 bg-emerald-500 border border-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                                                >
                                                    Mark paid
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
                    <div className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200" onClick={closeModal} />
                    <div className="bg-white rounded-xl w-full max-w-sm relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-200 p-6 border border-slate-200">
                        <button
                            onClick={closeModal}
                            className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6 text-center">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mx-auto mb-6 text-[#7c3aed] border border-slate-100">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
                                Updated
                            </h3>
                            <p className="text-xs font-semibold text-slate-600">Mark as {modalAction === 'INVOICED' ? 'Invoiced' : 'Received'}</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-3 ml-1 text-center">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={actionDate}
                                    onChange={(e) => setActionDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all text-center"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                onClick={confirmAction}
                                disabled={statusMutation.isPending}
                                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                {statusMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={closeModal} className="w-full py-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
