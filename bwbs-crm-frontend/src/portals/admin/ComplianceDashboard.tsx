import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Globe, History, Plus, Search,
    AlertCircle, FileText, ChevronRight,
    ExternalLink, Download, User, ArrowRight
} from 'lucide-react';
import complianceService from '../../services/compliance';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const ComplianceDashboard = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules');
    const [search, setSearch] = useState('');

    const rulesQuery = useQuery({
        queryKey: ['compliance', 'rules', search],
        queryFn: () => complianceService.getComplianceRules({ search }),
    });

    const historyQuery = useQuery({
        queryKey: ['compliance', 'history'],
        queryFn: () => complianceService.getComplianceChanges(),
        enabled: activeTab === 'history'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Regulatory Header */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-900 text-white rounded-xl shadow-sm">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-md border border-indigo-100">Visa rules</span>
                                <span className="text-xs text-slate-500">• Regulatory Compliance Archive</span>
                            </div>
                            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                                Visa Rules
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 max-w-lg font-medium leading-relaxed">
                        Managing global visa compliance rules and multi-jurisdictional regulatory frameworks. Ensuring persistent audit trails for all policy mutations.
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-4 lg:self-start">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-violet-700 transition-all group">
                        <Plus className="w-4 h-4" />
                        New rule
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Navigation & Metrics Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 self-start">
                        {(['rules', 'history'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-white text-[#7c3aed] shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab === 'rules' ? 'Policy Registry' : 'Mutation History'}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#7c3aed] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by country or rule..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold tracking-[0.1em] focus:ring-4 focus:ring-purple-500/5 focus:border-[#7c3aed]/30 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="xl:col-span-4 grid grid-cols-2 gap-4">
                    <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/10 rounded-2xl p-4">
                        <span className="block text-xs font-semibold text-[#7c3aed] mb-1">Active rules</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-slate-900">142</span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[11px] font-semibold rounded">+4</span>
                        </div>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                        <span className="block text-xs font-semibold text-rose-600 mb-1">Recent changes</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-semibold text-slate-900">03</span>
                            <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {activeTab === 'rules' ? (
                    <motion.div
                        key="rules"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-medium">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rule</th>
                                        <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Effective</th>
                                        <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {rulesQuery.data?.results.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-7 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center">
                                                        <Globe className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#7c3aed] transition-colors tracking-tight">{rule.country}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div>
                                                    <span className="block text-sm font-semibold text-slate-700">{rule.name}</span>
                                                    <span className="text-xs text-slate-500">{rule.visa_type || 'General Regulation'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`px-3 py-1 rounded-full text-[11px] font-semibold w-fit border ${rule.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    rule.severity === 'HIGH' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                    }`}>
                                                    {rule.severity_display}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 tracking-tight">
                                                    <span>{rule.effective_from || '∞'}</span>
                                                    <ArrowRight className="w-3 h-3 text-slate-300" />
                                                    <span>{rule.effective_to || '∞'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><FileText className="w-4 h-4" /></button>
                                                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><ExternalLink className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {historyQuery.data?.results.map((change) => (
                            <div key={change.id} className="bg-white rounded-xl p-6 border border-slate-200 flex items-start gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-900 group-hover:bg-[#7c3aed] transition-colors" />

                                <div className="flex-shrink-0 flex flex-col items-center gap-1.5 pt-1">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#7c3aed] transition-colors border border-slate-100">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <div className="h-full w-px bg-slate-100" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-semibold text-slate-900">{change.rule_details?.name}</span>
                                            <div className="px-2 py-0.5 bg-slate-900 text-white text-[11px] font-semibold rounded">
                                                {change.action_display}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <History className="w-3.5 h-3.5" />
                                            {new Date(change.changed_at).toLocaleString()}
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-bold text-slate-600 mb-3">"{change.change_summary || 'Regulatory policy parameter adjustment'}"</h4>

                                    <div className="flex items-center gap-3 bg-slate-50 w-fit px-3 py-2 rounded-xl border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200">
                                            <User className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">{change.changed_by_details?.first_name} {change.changed_by_details?.last_name}</span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors">
                                        Changes <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ComplianceDashboard;
