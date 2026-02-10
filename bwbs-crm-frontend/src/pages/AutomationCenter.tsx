import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Zap, Clock, ShieldAlert, Plus, Search,
    Power, Edit2, ChevronRight,
    AlertTriangle, CheckCircle2, XCircle, Info, Target
} from 'lucide-react';
import automationService from '../services/automation';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const AutomationCenter = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'runs' | 'escalations'>('rules');
    const [search, setSearch] = useState('');

    const rulesQuery = useQuery({
        queryKey: ['automation', 'rules', search],
        queryFn: () => automationService.getAutomationRules({ search }),
    });

    const runsQuery = useQuery({
        queryKey: ['automation', 'runs'],
        queryFn: () => automationService.getAutomationRuns(),
        enabled: activeTab === 'runs'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-purple-500/30 backdrop-blur-md">
                                Core Engine
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Systems Active</span>
                        </div>
                        <h1 className="text-4xl font-serif font-black text-white tracking-tight mb-4">
                            Automation Center
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            Orchestrate complex workflows, trigger autonomous actions, and manage task escalation policies across the global CRM node.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Rules</span>
                                <span className="text-2xl font-black text-white">24</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Runs (24h)</span>
                                <span className="text-2xl font-black text-purple-400">1.2k</span>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-100 transition-all active:scale-95 group">
                            <Plus className="w-4 h-4" />
                            Initialize New Workflow
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Navigation & Search */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 backdrop-blur-sm self-start">
                    {(['rules', 'runs', 'escalations'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab
                                ? 'bg-white text-slate-900 shadow-lg ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="FILTER BY RULE OR TRIGGER..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/30 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>
            </motion.div>

            {/* Content Area */}
            {activeTab === 'rules' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {rulesQuery.data?.results.map((rule) => (
                        <div key={rule.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-1.5 h-full ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${rule.is_active ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><Power className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <h3 className="text-xl font-serif font-black text-slate-900 mb-2 truncate group-hover:text-purple-600 transition-colors">{rule.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-tighter rounded-md">{rule.trigger_display}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• Priority {rule.priority}</span>
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">
                                {rule.description || 'No description provided for this autonomous workflow.'}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Last run 2h ago</span>
                                </div>
                                <button className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Execution Logs <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Ghost Rule Add Button */}
                    <button className="bg-slate-50/50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 hover:border-purple-300 hover:bg-purple-50/10 transition-all group min-h-[300px]">
                        <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-purple-500 transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Add Logic Node</span>
                    </button>
                </motion.div>
            )}

            {activeTab === 'runs' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                >
                    <table className="w-full text-left font-medium">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Unit</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {runsQuery.data?.results.map((run) => (
                                <tr key={run.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${run.status === 'SUCCESS' ? 'bg-emerald-500' : run.status === 'FAILED' ? 'bg-rose-500' : 'bg-slate-300'}`} />
                                            <span className="text-sm font-black text-slate-900">{run.rule_details?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-mono text-xs text-slate-400 lowercase tracking-tighter">#{run.id.split('-')[0]}</td>
                                    <td className="px-8 py-5">
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit ${run.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                                            run.status === 'FAILED' ? 'bg-rose-50 text-rose-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {run.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                                            {run.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                                            {run.status === 'SKIPPED' && <Info className="w-3 h-3" />}
                                            <span className="text-[10px] font-black uppercase tracking-wider">{run.status_display}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500">{new Date(run.ran_at).toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {activeTab === 'escalations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldAlert className="w-32 h-32" />
                            </div>
                            <h3 className="text-2xl font-serif font-black text-slate-900 mb-6">Escalation Matrix</h3>
                            <div className="space-y-4">
                                {[
                                    { name: 'Critical Lead Delay', priority: 'High', hours: 4, role: 'Branch Manager' },
                                    { name: 'Documentation Overdue', priority: 'Medium', hours: 24, role: 'Operations Lead' },
                                    { name: 'Payment Verification', priority: 'High', hours: 2, role: 'Finance Director' }
                                ].map((policy, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl bg-white shadow-sm ${policy.priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-black text-slate-900">{policy.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escalate after {policy.hours}h to {policy.role}</span>
                                            </div>
                                        </div>
                                        <button className="text-slate-300 group-hover:text-slate-900 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#AD03DE] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-purple-200">
                        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[100px]" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-serif font-black italic mb-6">Service Level Logic</h3>
                            <p className="text-purple-100 font-medium leading-relaxed mb-8">
                                Task escalation automates accountability by rerouting overdue critical operations to appropriate management nodes.
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div>
                                    <span className="block text-[10px] font-black text-purple-300 uppercase tracking-widest mb-2">Protocol Coverage</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                        <span className="text-xl font-black">100% Core</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-purple-300 uppercase tracking-widest mb-2">Matrix Complexity</span>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-white" />
                                        <span className="text-xl font-black">Level 4</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-2xl">
                                Configure System Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AutomationCenter;
