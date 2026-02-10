import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, UserCircle, Scan, Map, ArrowRight,
    Link2, FileText, BadgeCheck, Plus, Search,
    ArrowUpRight, CheckCircle2, RefreshCw,
    X, Trash2, Edit2, AlertCircle, Info, BarChart3,
    Calendar, Globe, ShieldCheck, Zap
} from 'lucide-react';
import operationsService from '../services/operations';
import type { PartnerContract, Agent, OCRJob, AgentStats } from '../services/operations';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const OperationsHub = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'contracts' | 'agents' | 'ocr'>('contracts');
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Queries
    const contractsQuery = useQuery({
        queryKey: ['operations', 'contracts'],
        queryFn: () => operationsService.getPartnerContracts(),
    });

    const agentsQuery = useQuery({
        queryKey: ['operations', 'agents'],
        queryFn: () => operationsService.getAgents(),
        enabled: activeTab === 'agents'
    });

    const ocrQuery = useQuery({
        queryKey: ['operations', 'ocr'],
        queryFn: () => operationsService.getOCRJobs(),
        enabled: activeTab === 'ocr'
    });

    const { data: universitiesData } = useQuery({
        queryKey: ['universities'],
        queryFn: () => import('../services/universities').then(m => m.getUniversities({ page: 1 })),
        enabled: isContractModalOpen
    });

    // Mutations
    const contractMutation = useMutation({
        mutationFn: (data: any) => selectedItem
            ? operationsService.updatePartnerContract(selectedItem.id, data)
            : operationsService.createPartnerContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations', 'contracts'] });
            setIsContractModalOpen(false);
            setSelectedItem(null);
        }
    });

    const agentMutation = useMutation({
        mutationFn: (data: any) => selectedItem
            ? operationsService.updateAgent(selectedItem.id, data)
            : operationsService.createAgent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations', 'agents'] });
            setIsAgentModalOpen(false);
            setSelectedItem(null);
        }
    });

    const triggerOCRMutation = useMutation({
        mutationFn: (id: string) => operationsService.triggerOCRJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations', 'ocr'] });
        }
    });

    const deleteAgentMutation = useMutation({
        mutationFn: (id: string) => operationsService.deleteAgent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operations', 'agents'] });
        }
    });

    const handleTriggerOCR = (id: string) => {
        triggerOCRMutation.mutate(id);
    };

    const handleContractSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        contractMutation.mutate(data);
    };

    const handleAgentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        agentMutation.mutate(data);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Mission Control Header */}
            <motion.div variants={itemVariants} className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-sm">
                            Mission Control
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Operational Grid Active</span>
                    </div>
                    <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight">
                        Operations Hub
                    </h1>
                    <p className="text-slate-500 text-sm mt-3 max-w-lg font-medium leading-relaxed">
                        The central nervous system for partnership architecture, agent hierarchies, and robotic process automation via high-fidelity OCR systems.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                    <button
                        onClick={() => { setSelectedItem(null); setIsContractModalOpen(true); }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 group"
                    >
                        <Plus className="w-4 h-4" />
                        New Partner Agreement
                    </button>
                    <div className="flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">OCR Cloud: Optimal</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">Syncing Node 04</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Hub Navigation */}
            <motion.div variants={itemVariants} className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 w-fit">
                {(['contracts', 'agents', 'ocr'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest ${activeTab === tab
                            ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab === 'contracts' ? 'Unit Partners' : tab === 'agents' ? 'Agent Tree' : 'Robotic ID Reader'}
                    </button>
                ))}
            </motion.div>

            {/* Grid Logic */}
            <AnimatePresence mode="wait">
                {activeTab === 'contracts' && (
                    <motion.div
                        key="contracts"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {contractsQuery.data?.results.map((contract) => (
                            <div key={contract.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group relative">
                                <div className="absolute top-8 right-8 flex gap-2">
                                    <button
                                        onClick={() => { setSelectedItem(contract); setIsContractModalOpen(true); }}
                                        className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#AD03DE] hover:text-white transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${contract.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {contract.status_display}
                                    </span>
                                    {contract.days_until_expiry && contract.days_until_expiry < 30 && (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded uppercase flex items-center gap-1">
                                            <AlertCircle className="w-2.5 h-2.5" /> Expiring Soon
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-serif font-black text-slate-900 mb-2 truncate pr-20">{contract.university_details?.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">
                                    <Map className="w-3 h-3" /> {contract.university_details?.country}
                                    <span className="mx-2 text-slate-200">|</span>
                                    <FileText className="w-3 h-3" /> {contract.contract_number || 'N/A'}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider">Valid from</span>
                                        <span className="text-slate-900 font-black">{contract.start_date}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider">Terminates</span>
                                        <span className="text-slate-900 font-black">{contract.end_date || 'Ongoing'}</span>
                                    </div>
                                    {contract.days_until_expiry && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Days Remaining</span>
                                            <span className="text-[#AD03DE] font-black">{contract.days_until_expiry} Days</span>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full py-4 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                    Examine Terms <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'agents' && (
                    <motion.div
                        key="agents"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-slate-900 italic">Agent Hierarchy</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global recruitment network nodes</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="FILTER NETWORK..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSelectedItem(null); setIsAgentModalOpen(true); }}
                                    className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {agentsQuery.data?.results.filter(a => a.name.toUpperCase().includes(searchQuery)).map((agent) => (
                                <div key={agent.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-[#AD03DE] group-hover:text-white transition-colors">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedItem(agent); setIsStatsModalOpen(true); }}
                                                className="p-2 bg-white rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors shadow-sm"
                                            >
                                                <BarChart3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedItem(agent); setIsAgentModalOpen(true); }}
                                                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => deleteAgentMutation.mutate(agent.id)}
                                                className="p-2 bg-white rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{agent.name}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">{agent.country} Network</span>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase">Rate: {agent.commission_rate}%</div>
                                        {agent.sub_agents_count ? (
                                            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase">{agent.sub_agents_count} Sub-Agents</div>
                                        ) : null}
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-slate-900 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'ocr' && (
                    <motion.div
                        key="ocr"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tight">Robotic Identification Processing</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Intelligent Extraction Node Alpha</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">Core Active</span>
                                </div>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Document Hash</th>
                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Processing State</th>
                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Confidence Entropy</th>
                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Timestamp</th>
                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Raw Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ocrQuery.data?.results.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 border border-slate-100 rounded-lg bg-white shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <Scan className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-slate-900 uppercase block leading-none mb-1">{job.document_details?.file_name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(job.document_details as any)?.category_display}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                job.status === 'PROCESSING' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 italic' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {job.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{job.status_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                    <span>Quality Index</span>
                                                    <span>{job.confidence || 0}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-full bg-[#AD03DE] rounded-full transition-all duration-1000" style={{ width: `${job.confidence || 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(job.created_at).toLocaleTimeString()}</td>
                                        <td className="px-10 py-6 text-right">
                                            {job.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleTriggerOCR(job.id)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 ml-auto"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Trigger Robotic Scan
                                                </button>
                                            ) : (
                                                <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                                                    <Link2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contract Modal */}
            <AnimatePresence>
                {isContractModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsContractModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <form onSubmit={handleContractSubmit} className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-serif font-black text-slate-900 italic">
                                        {selectedItem ? 'Edit Agreement' : 'New Partnership'}
                                    </h1>
                                    <button type="button" onClick={() => setIsContractModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Partner</label>
                                        <select
                                            name="university"
                                            defaultValue={selectedItem?.university}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none shadow-inner"
                                        >
                                            <option value="">Select University...</option>
                                            {universitiesData?.results.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Identifier</label>
                                            <input
                                                name="contract_number"
                                                type="text"
                                                defaultValue={selectedItem?.contract_number}
                                                placeholder="e.g. CN-8829"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                                            <select
                                                name="status"
                                                defaultValue={selectedItem?.status || 'ACTIVE'}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none shadow-inner"
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="EXPIRED">EXPIRED</option>
                                                <option value="TERMINATED">TERMINATED</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                            <input
                                                name="start_date"
                                                type="date"
                                                defaultValue={selectedItem?.start_date}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                            <input
                                                name="end_date"
                                                type="date"
                                                defaultValue={selectedItem?.end_date}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Notes</label>
                                        <textarea
                                            name="notes"
                                            defaultValue={selectedItem?.notes}
                                            rows={3}
                                            placeholder="Enter contract specific requirements or notes..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button type="button" onClick={() => setIsContractModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                                    <button type="submit" disabled={contractMutation.isPending} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all disabled:opacity-50">
                                        {contractMutation.isPending ? 'Processing...' : 'Save Protocol'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Agent Modal */}
            <AnimatePresence>
                {isAgentModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAgentModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <form onSubmit={handleAgentSubmit} className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-serif font-black text-slate-900 italic">
                                        {selectedItem ? 'Recalibrate Agent' : 'Deploy New Agent'}
                                    </h1>
                                    <button type="button" onClick={() => setIsAgentModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            defaultValue={selectedItem?.name}
                                            required
                                            placeholder="Global Recruitment Node 1"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input
                                                name="email"
                                                type="email"
                                                defaultValue={selectedItem?.email}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input
                                                name="phone"
                                                type="text"
                                                defaultValue={selectedItem?.phone}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                                            <input
                                                name="commission_rate"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={selectedItem?.commission_rate}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jurisdiction (Country)</label>
                                            <input
                                                name="country"
                                                type="text"
                                                defaultValue={selectedItem?.country}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Entity (Optional)</label>
                                        <select
                                            name="parent_agent"
                                            defaultValue={selectedItem?.parent_agent || ''}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none shadow-inner"
                                        >
                                            <option value="">No Parent (Primary Node)</option>
                                            {agentsQuery.data?.results.filter(a => a.id !== selectedItem?.id).map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button type="button" onClick={() => setIsAgentModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                                    <button type="submit" disabled={agentMutation.isPending} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all disabled:opacity-50">
                                        {agentMutation.isPending ? 'Syncing...' : 'Sync Network'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Agent Stats Modal */}
            <AnimatePresence>
                {isStatsModalOpen && selectedItem && (
                    <AgentStatsBoard
                        agent={selectedItem}
                        onClose={() => { setIsStatsModalOpen(false); setSelectedItem(null); }}
                    />
                )}
            </AnimatePresence>

            {/* Contract Terms Slide-over */}
            <AnimatePresence>
                {isTermsModalOpen && selectedItem && (
                    <ContractTermsBoard
                        contract={selectedItem}
                        onClose={() => { setIsTermsModalOpen(false); setSelectedItem(null); }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Sub-components for better organization
const AgentStatsBoard = ({ agent, onClose }: { agent: Agent, onClose: () => void }) => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['operations', 'agent-stats', agent.id],
        queryFn: () => operationsService.getAgentStats(agent.id)
    });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl relative z-10"
            >
                <div className="p-12">
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                                <BarChart3 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-serif font-black text-slate-900 italic">Agent Intelligence Board</h2>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Deep analysis for {agent.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-slate-200 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Total Assignments', value: stats?.total_assignments, icon: Zap, color: 'indigo' },
                                { label: 'Primary Node Roles', value: stats?.primary_roles, icon: ShieldCheck, color: 'emerald' },
                                { label: 'Affiliated Students', value: stats?.student_count, icon: UserCircle, color: 'blue' },
                                { label: 'Active Pipeline', value: stats?.lead_count, icon: ArrowUpRight, color: 'amber' }
                            ].map((stat, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                        <stat.icon className="w-16 h-16" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{stat.label}</span>
                                    <div className="text-4xl font-black text-slate-900">{stat.value || 0}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-serif font-black italic mb-2">Network Jurisdiction</h4>
                                <p className="text-slate-400 text-xs font-medium max-w-sm">This agent operates within the <b>{agent.country}</b> regulatory framework with a verified commission index of <b>{agent.commission_rate}%</b>.</p>
                            </div>
                            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest">
                                Node ID: {agent.id.slice(0, 8)}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ContractTermsBoard = ({ contract, onClose }: { contract: PartnerContract, onClose: () => void }) => {
    return (
        <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-xl flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full relative z-10 shadow-2xl flex flex-col"
            >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-black text-slate-900 italic">Agreement Artifacts</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Deep analysis of operational terms</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Partner Profile</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm"><Building2 className="w-5 h-5 text-slate-400" /></div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Institution</span>
                                        <span className="text-sm font-black text-slate-900">{contract.university_details?.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Country</span>
                                    <span className="text-sm font-black text-slate-900">{contract.university_details?.country}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" /> Lifecycle Schedule
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Activation</span>
                                <span className="text-sm font-black text-slate-900">{contract.start_date}</span>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Termination</span>
                                <span className="text-sm font-black text-slate-900">{contract.end_date || 'Continuous'}</span>
                            </div>
                            <div className="col-span-2 p-6 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center text-white">
                                <div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Operational Runway</span>
                                    <span className="text-lg font-black">{contract.days_until_expiry || '∞'} Days Remaining</span>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Globe className="w-6 h-6 text-indigo-400" /></div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Protocol Notes
                        </h3>
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
                            <Info className="absolute top-8 right-8 w-5 h-5 text-indigo-500 opacity-20" />
                            <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                                "{contract.notes || 'No operational baseline documented for this artifact.'}"
                            </p>
                        </div>
                    </section>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all"
                    >
                        Close Protocol
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OperationsHub;
