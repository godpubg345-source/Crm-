import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, UserCircle, Scan, Map, ArrowRight,
    Link2, FileText, BadgeCheck, Plus, Search,
    ArrowUpRight, CheckCircle2, RefreshCw,
    X, Trash2, Edit2, AlertCircle, Info, BarChart3,
    Calendar, Globe, ShieldCheck, Zap
} from 'lucide-react';
import operationsService from '../../services/operations';
import type { PartnerContract, Agent } from '../../services/operations';

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
        queryFn: () => import('../../services/universities').then(m => m.getUniversities({ page: 1 })),
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
            <motion.div variants={itemVariants} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="absolute inset-0 bg-white" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-lg">
                            Partners
                        </div>
                        <span className="text-xs font-semibold text-slate-400">• Sub-agents & contracts</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                        Agents & Contracts
                    </h1>
                    <p className="text-slate-500 text-sm mt-3 max-w-lg font-medium leading-relaxed">
                        Manage sub-agents, their student assignments and partner contracts, plus document OCR jobs.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                    <button
                        onClick={() => { setSelectedItem(null); setIsContractModalOpen(true); }}
                        className="flex items-center justify-center gap-3 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-800 transition-all group"
                    >
                        <Plus className="w-4 h-4" />
                        New contract
                    </button>
                    <div className="flex items-center gap-6 px-6 py-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-slate-600"></span>
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-600"></span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Hub Navigation */}
            <motion.div variants={itemVariants} className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
                {(['contracts', 'agents', 'ocr'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3.5 rounded-xl text-xs font-semibold transition-all duration-300 ${activeTab === tab
                            ? 'bg-white text-slate-900 shadow-sm '
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab === 'contracts' ? 'University Contracts' : tab === 'agents' ? 'Sub-agents' : 'Document Scanning'}
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
                            <div key={contract.id} className="bg-white rounded-xl border border-slate-200 p-6 transition-all duration-200 group relative">
                                <div className="absolute top-8 right-8 flex gap-2">
                                    <button
                                        onClick={() => { setSelectedItem(contract); setIsContractModalOpen(true); }}
                                        className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#7c3aed] hover:text-white transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${contract.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {contract.status_display}
                                    </span>
                                    {contract.days_until_expiry && contract.days_until_expiry < 30 && (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[11px] font-semibold rounded flex items-center gap-1">
                                            <AlertCircle className="w-2.5 h-2.5" /> Expiring Soon
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2 truncate pr-20">{contract.university_details?.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 border-b border-slate-50 pb-4">
                                    <Map className="w-3 h-3" /> {contract.university_details?.country}
                                    <span className="mx-2 text-slate-200">|</span>
                                    <FileText className="w-3 h-3" /> {contract.contract_number || 'N/A'}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold">Valid from</span>
                                        <span className="text-slate-900 font-semibold">{contract.start_date}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-bold">Ends</span>
                                        <span className="text-slate-900 font-semibold">{contract.end_date || 'Ongoing'}</span>
                                    </div>
                                    {contract.days_until_expiry && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold">Days Remaining</span>
                                            <span className="text-[#7c3aed] font-semibold">{contract.days_until_expiry} Days</span>
                                        </div>
                                    )}
                                </div>

                                <button className="w-full py-4 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 group-hover:bg-violet-600 hover:bg-violet-700 group-hover:text-white transition-all">
                                    View <ArrowRight className="w-4 h-4" />
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
                        className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900">Agents</h3>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Your sub-agents and who they report to</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="Search agents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSelectedItem(null); setIsAgentModalOpen(true); }}
                                    className="p-3 bg-slate-900 text-white rounded-xl shadow-sm transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {agentsQuery.data?.results.filter(a => a.name.toUpperCase().includes(searchQuery)).map((agent) => (
                                <div key={agent.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
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
                                    <h4 className="text-sm font-semibold text-slate-900 truncate tracking-tight">{agent.name}</h4>
                                    <span className="text-xs text-slate-500 block mb-4">{agent.country} Network</span>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-semibold rounded">Rate: {agent.commission_rate}%</div>
                                        {agent.sub_agents_count ? (
                                            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-semibold rounded">{agent.sub_agents_count} Sub-Agents</div>
                                        ) : null}
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[11px] font-semibold text-slate-500">Verified</span>
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
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Document scanning (OCR)</h3>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Reads text from uploaded documents</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-semibold text-slate-600">Core Active</span>
                                </div>
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Confidence</th>
                                    <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Raw data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ocrQuery.data?.results.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <Scan className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-900 block leading-none mb-1">{job.document_details?.file_name}</span>
                                                    <span className="text-[11px] text-slate-500">{(job.document_details as any)?.category_display}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                job.status === 'PROCESSING' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 ' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {job.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                                <span className="text-xs font-semibold">{job.status_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 tracking-tight">
                                                    <span>Quality</span>
                                                    <span>{job.confidence || 0}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#7c3aed] rounded-full transition-all duration-200" style={{ width: `${job.confidence || 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-xs text-slate-500">{new Date(job.created_at).toLocaleTimeString()}</td>
                                        <td className="px-6 py-6 text-right">
                                            {job.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleTriggerOCR(job.id)}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-semibold shadow-sm flex items-center gap-2 ml-auto"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Scan document
                                                </button>
                                            ) : (
                                                <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-violet-600 hover:bg-violet-700 hover:text-white transition-all">
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
                            className="absolute inset-0 bg-slate-900/40"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-sm relative z-10"
                        >
                            <form onSubmit={handleContractSubmit} className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-semibold text-slate-900">
                                        {selectedItem ? 'Edit Agreement' : 'New Partnership'}
                                    </h1>
                                    <button type="button" onClick={() => setIsContractModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 ml-1">University Partner</label>
                                        <select
                                            name="university"
                                            defaultValue={selectedItem?.university}
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            <option value="">Select University...</option>
                                            {universitiesData?.results.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Contract number</label>
                                            <input
                                                name="contract_number"
                                                type="text"
                                                defaultValue={selectedItem?.contract_number}
                                                placeholder="e.g. CN-8829"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Current Status</label>
                                            <select
                                                name="status"
                                                defaultValue={selectedItem?.status || 'ACTIVE'}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none"
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="EXPIRED">EXPIRED</option>
                                                <option value="TERMINATED">TERMINATED</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Start Date</label>
                                            <input
                                                name="start_date"
                                                type="date"
                                                defaultValue={selectedItem?.start_date}
                                                required
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">End Date</label>
                                            <input
                                                name="end_date"
                                                type="date"
                                                defaultValue={selectedItem?.end_date}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 ml-1">Notes</label>
                                        <textarea
                                            name="notes"
                                            defaultValue={selectedItem?.notes}
                                            rows={3}
                                            placeholder="Any special terms or notes..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <button type="button" onClick={() => setIsContractModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-semibold text-xs hover:bg-slate-200 transition-all">Cancel</button>
                                    <button type="submit" disabled={contractMutation.isPending} className="flex-1 py-2.5 bg-violet-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-violet-700 transition-all disabled:opacity-50">
                                        {contractMutation.isPending ? 'Processing...' : 'Save'}
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
                            className="absolute inset-0 bg-slate-900/40"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-sm relative z-10"
                        >
                            <form onSubmit={handleAgentSubmit} className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h1 className="text-3xl font-semibold text-slate-900">
                                        {selectedItem ? 'Recalibrate Agent' : 'Deploy New Agent'}
                                    </h1>
                                    <button type="button" onClick={() => setIsAgentModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 ml-1">Agent name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            defaultValue={selectedItem?.name}
                                            required
                                            placeholder="e.g. Lahore Study Partners"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
                                            <input
                                                name="email"
                                                type="email"
                                                defaultValue={selectedItem?.email}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Phone Number</label>
                                            <input
                                                name="phone"
                                                type="text"
                                                defaultValue={selectedItem?.phone}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Commission Rate (%)</label>
                                            <input
                                                name="commission_rate"
                                                type="number"
                                                step="0.01"
                                                required
                                                defaultValue={selectedItem?.commission_rate}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">Country</label>
                                            <input
                                                name="country"
                                                type="text"
                                                defaultValue={selectedItem?.country}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 ml-1">Reports to (optional)</label>
                                        <select
                                            name="parent_agent"
                                            defaultValue={selectedItem?.parent_agent || ''}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 font-bold text-slate-900 transition-all appearance-none"
                                        >
                                            <option value="">None (primary agent)</option>
                                            {agentsQuery.data?.results.filter(a => a.id !== selectedItem?.id).map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-4">
                                    <button type="button" onClick={() => setIsAgentModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-semibold text-xs hover:bg-slate-200 transition-all">Cancel</button>
                                    <button type="submit" disabled={agentMutation.isPending} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm shadow-sm transition-all disabled:opacity-50">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60" />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-sm relative z-10"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
                                <BarChart3 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-semibold text-slate-900">Agent Overview</h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Deep analysis for {agent.name}</p>
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
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {[
                                { label: 'Total Assignments', value: stats?.total_assignments, icon: Zap, color: 'indigo' },
                                { label: 'Primary Agents', value: stats?.primary_roles, icon: ShieldCheck, color: 'emerald' },
                                { label: 'Affiliated Students', value: stats?.student_count, icon: UserCircle, color: 'blue' },
                                { label: 'Active Pipeline', value: stats?.lead_count, icon: ArrowUpRight, color: 'amber' }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                        <stat.icon className="w-16 h-16" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 block mb-2">{stat.label}</span>
                                    <div className="text-3xl font-semibold text-slate-900">{stat.value || 0}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-semibold mb-2">Country</h4>
                                <p className="text-slate-400 text-xs font-medium max-w-sm">This agent works in <b>{agent.country}</b> with a commission rate of <b>{agent.commission_rate}%</b>.</p>
                            </div>
                            <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/10 text-xs font-semibold">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full relative z-10 shadow-sm flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Agent Contracts</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-1">Contract details</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg">Partner Profile</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm"><Building2 className="w-5 h-5 text-slate-400" /></div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-400 block">Institution</span>
                                        <span className="text-sm font-semibold text-slate-900">{contract.university_details?.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-slate-400 block">Country</span>
                                    <span className="text-sm font-semibold text-slate-900">{contract.university_details?.country}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" /> Dates
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Start</span>
                                <span className="text-sm font-semibold text-slate-900">{contract.start_date}</span>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs font-semibold text-slate-400 block mb-1">End</span>
                                <span className="text-sm font-semibold text-slate-900">{contract.end_date || 'Continuous'}</span>
                            </div>
                            <div className="col-span-2 p-6 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center text-white">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1">Time left</span>
                                    <span className="text-lg font-semibold">{contract.days_until_expiry || '∞'} Days Remaining</span>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Globe className="w-6 h-6 text-indigo-400" /></div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" /> Notes
                        </h3>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative">
                            <Info className="absolute top-8 right-8 w-5 h-5 text-indigo-500 opacity-20" />
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                "{contract.notes || 'No operational baseline documented for this artifact.'}"
                            </p>
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-violet-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-violet-700 transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OperationsHub;
