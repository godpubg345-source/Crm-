import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Database, Trash2, Key, ChevronRight, CheckCircle2,
    Lock, Shield
} from 'lucide-react';
import governanceService from '../services/governance';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const GovernancePanel = () => {
    const [activeTab, setActiveTab] = useState<'retention' | 'deletions' | 'access'>('retention');

    const retentionQuery = useQuery({
        queryKey: ['governance', 'retention'],
        queryFn: () => governanceService.getRetentionPolicies(),
    });

    const deletionsQuery = useQuery({
        queryKey: ['governance', 'deletions'],
        queryFn: () => governanceService.getDataDeletionRequests(),
        enabled: activeTab === 'deletions'
    });

    const accessQuery = useQuery({
        queryKey: ['governance', 'access'],
        queryFn: () => governanceService.getAccessReviewCycles(),
        enabled: activeTab === 'access'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Security Header */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative">
                        <Lock className="w-10 h-10" />
                        <div className="absolute -top-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded border border-slate-200">System Integrity</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• Global Governance Node</span>
                        </div>
                        <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight">
                            Governance Control
                        </h1>
                        <p className="text-sm text-slate-500 max-w-lg mt-2 font-medium leading-relaxed">
                            Managing data persistence life-cycles, privacy operations, and systemic access reviews for the entire CRM infrastructure.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95 group">
                        <Shield className="w-4 h-4" />
                        Initiate Access Review
                    </button>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div variants={itemVariants} className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 backdrop-blur-sm w-fit">
                {(['retention', 'deletions', 'access'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab
                            ? 'bg-white text-slate-900 shadow-xl ring-1 ring-black/5'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab === 'retention' ? 'Data Retention' : tab === 'deletions' ? 'Privacy Ops' : 'Access Control'}
                    </button>
                ))}
            </motion.div>

            {/* Content Logic */}
            <AnimatePresence mode="wait">
                {activeTab === 'retention' && (
                    <motion.div
                        key="retention"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {retentionQuery.data?.results.map((policy) => (
                            <div key={policy.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Database className="w-32 h-32" />
                                </div>
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${policy.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        {policy.is_active ? 'Active Policy' : 'Disabled'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-serif font-black text-slate-900 mb-2">{policy.entity_type_display}</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Threshold</span>
                                        <span className="text-sm font-black text-[#AD03DE]">{policy.retention_days} Days</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-100" />
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Destiny</span>
                                        <span className="text-sm font-black text-slate-700">{policy.action_display}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic mb-8">
                                    {policy.notes || 'Default system persistence protocol for ' + (policy.entity_type_display?.toLowerCase() || 'unknown') + ' records.'}
                                </p>
                                <button className="w-full py-3 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 group-hover:border-slate-900 transition-all">
                                    Modify Protocol
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'deletions' && (
                    <motion.div
                        key="deletions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privacy Request</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {deletionsQuery.data?.results.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 text-slate-400 rounded-xl">
                                                    <Trash2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 uppercase">#{req.id.split('-')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-xs text-slate-600 font-bold uppercase tracking-wider">{req.request_type_display}</td>
                                        <td className="px-10 py-6 text-xs text-slate-500 font-medium">{req.requested_by_details?.email}</td>
                                        <td className="px-10 py-6 text-xs">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-fit ${req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {req.status_display}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {activeTab === 'access' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-2xl font-serif font-black text-slate-900 mb-8 px-2">Active Review Cycles</h3>
                            <div className="space-y-4">
                                {accessQuery.data?.results.map((cycle) => (
                                    <div key={cycle.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:bg-slate-900 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-white/10 group-hover:text-white transition-colors">
                                                <Key className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-black text-slate-900 group-hover:text-white transition-colors">{cycle.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cycle.period_start} — {cycle.period_end}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-[#AD03DE] uppercase tracking-widest group-hover:text-purple-300 transition-colors">{cycle.status_display}</span>
                                            <button className="p-2 rounded-xl text-slate-300 group-hover:text-white hover:bg-white/10 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <ShieldAlert className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <ShieldAlert className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-serif font-black italic">Security Insight</h3>
                                </div>
                                <p className="text-slate-300 font-medium leading-relaxed text-lg mb-8">
                                    Systematic access reviews prevent "privilege creep" and ensure that only verified personnel maintain persistence across the CRM's critical data paths.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        <span className="text-sm font-black uppercase tracking-wider">Next deep-review: APR 2026</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        <span className="text-sm font-black uppercase tracking-wider">Automated Revoke Status: ACTIVE</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-slate-100 transition-all">
                                Audit Personnel Entitlements
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GovernancePanel;
