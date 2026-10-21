import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, MessageSquare, Send, Plus, Search,
    Copy, Trash2, CheckCircle2, AlertCircle,
    ChevronRight, User, ExternalLink
} from 'lucide-react';
import messagingService from '../../services/messaging';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const MessagingCenter = () => {
    const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
    const [search, setSearch] = useState('');

    const templatesQuery = useQuery({
        queryKey: ['messaging', 'templates', search],
        queryFn: () => messagingService.getMessageTemplates({ search }),
    });

    const logsQuery = useQuery({
        queryKey: ['messaging', 'logs'],
        queryFn: () => messagingService.getMessageLogs(),
        enabled: activeTab === 'logs'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Communication Header */}
            <motion.div variants={itemVariants} className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full border border-white/30">
                                Templates
                            </div>
                            <span className="text-xs font-semibold text-indigo-200">Ready</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-white tracking-tight mb-4">
                            Message Templates
                        </h1>
                        <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                            Reusable email, SMS and WhatsApp messages, and a history of what was sent.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-all group">
                            <Plus className="w-4 h-4 transition-transform duration-200" />
                            New template
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Navigation & Toolbar */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 self-start">
                    {(['templates', 'logs'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${activeTab === tab
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-500/10'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'templates' ? 'Templates' : 'Sent Messages'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold tracking-[0.1em] focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
            </motion.div>

            {/* Content Logic */}
            <AnimatePresence mode="wait">
                {activeTab === 'templates' ? (
                    <motion.div
                        key="templates"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {templatesQuery.data?.results.map((tpl: any) => (
                            <div key={tpl.id} className="bg-white rounded-xl p-6 border border-slate-200 transition-all duration-200 group relative flex flex-col justify-between min-h-[320px]">
                                <div>
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                {tpl.category === 'EMAIL' ? <Mail className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <span className="block text-xs font-semibold text-slate-900 tracking-tight">{tpl.name}</span>
                                                <span className="text-[11px] font-semibold text-slate-400">{tpl.category_display}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg"><Copy className="w-4 h-4" /></button>
                                            <button className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-slate-600 mb-2 truncate">"{tpl.subject || 'No Subject Defined'}"</h4>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-3 leading-relaxed">
                                        {tpl.content_preview || 'No preview available.'}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        <span className="text-[11px] font-semibold text-slate-400">Ready</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[11px] font-semibold text-indigo-600 transition-transform">
                                        Use template <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Compose Card */}
                        <button className="bg-slate-50/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 hover:bg-slate-100/50 hover:border-indigo-300 transition-all group min-h-[320px]">
                            <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-indigo-500 transition-colors">
                                <Plus className="w-8 h-8" />
                            </div>
                            <span className="text-sm font-semibold text-slate-400">New template</span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Raw</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logsQuery.data?.results.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
                                                    <Send className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-900 block leading-none mb-1">TX-{log.id.split('-')[0].toUpperCase()}</span>
                                                    <span className="text-[11px] text-slate-500"></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{(log as any).recipient_details?.full_name || log.recipient}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border w-fit ${log.status === 'SENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                log.status === 'FAILED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {log.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                <span className="text-[11px] font-semibold">{log.status_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-xs text-slate-400 lowercase">{log.sent_at ? new Date(log.sent_at).toLocaleString() : 'PENDING'}</td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MessagingCenter;
