import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortalMe } from '../../services/portal';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Receipt,
    Download,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { PortalPayment } from '../../services/portal';

const PortalPayments: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-48 bg-white rounded-[2.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-2xl" />
                    ))}
                </div>
                <div className="h-96 bg-white rounded-[2.5rem]" />
            </div>
        );
    }

    const payments = data?.payments ?? [];

    const totalPaid = payments
        .filter((p: PortalPayment) => p.status === 'COMPLETED' || p.status === 'SUCCESS')
        .reduce((sum: number, p: PortalPayment) => sum + parseFloat(p.amount), 0);

    const pendingAmount = payments
        .filter((p: PortalPayment) => p.status === 'PENDING')
        .reduce((sum: number, p: PortalPayment) => sum + parseFloat(p.amount), 0);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 font-serif">Financial Overview</h1>
                    <p className="text-slate-500 font-medium">Track your tuition fees, service charges and deposits safely.</p>
                </div>
                <div className="relative z-10 h-14 bg-slate-900 text-white rounded-2xl px-8 font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all cursor-pointer shadow-lg shadow-slate-200 group">
                    <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Secure Payment Gateway
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <ArrowDownLeft className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Settled</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">£{totalPaid.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1.5 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Assets
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Pipeline</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">£{pendingAmount.toLocaleString()}</p>
                    <p className="text-xs font-bold text-amber-500/80 mt-4 italic">Processing Clearing House...</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                            <Receipt className="w-6 h-6 text-indigo-300" />
                        </div>
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Projected Due</span>
                    </div>
                    <p className="text-3xl font-black tracking-tight">£0.00</p>
                    <p className="text-xs font-bold text-indigo-400 mt-4">Automated budget alerts active.</p>
                </motion.div>
            </div>

            {/* Transactions List */}
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Transaction History</h2>
                    <button className="p-2 text-slate-400 hover:text-purple-600 transition-colors">
                        <Download className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.length > 0 ? payments.map((p: PortalPayment) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-900 font-mono">#{p.id.substring(0, 8).toUpperCase()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{p.transaction_type_display || 'General Payment'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.method_display || 'Online'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-900">£{parseFloat(p.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={clsx(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            (p.status === 'COMPLETED' || p.status === 'SUCCESS') ? "bg-emerald-50 text-emerald-600" :
                                                p.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                                                    "bg-red-50 text-red-600"
                                        )}>
                                            {(p.status === 'COMPLETED' || p.status === 'SUCCESS') ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {p.status_display || p.status}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-bold">No transactions recorded yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Support Card */}
            <div className="bg-indigo-50 rounded-[2rem] p-8 flex items-center justify-between border border-indigo-100">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900">Payment Trouble?</h3>
                        <p className="text-sm text-slate-500 font-medium">If your payment isn't showing up, please send the receipt to accounts@bwbs.education.</p>
                    </div>
                </div>
                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 group">
                    Contact Accounts <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PortalPayments;
