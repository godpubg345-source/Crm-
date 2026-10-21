import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empGetMyLeads, empUpdateLead, empArchiveLead, empConvertToStudent } from '../../services/empPortal';
import { Users, Loader2, Mail, Phone, ArrowRight, UserPlus, XCircle, PhoneCall, CheckCircle2, ArchiveX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Kanban Columns mapped from user workflow
const COLUMNS = [
    { id: 'NEW', title: 'New', icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    { id: 'CONTACTED', title: 'Contacted', icon: ArrowRight, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-200' },
    { id: 'QUALIFIED', title: 'Interested', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50/50', border: 'border-teal-200' },
    { id: 'LOST', title: 'Not Responding', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-200' },
];

const EmpLeads: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Archive Modal State
    const [archivingLeadId, setArchivingLeadId] = useState<string | null>(null);
    const [archiveReason, setArchiveReason] = useState('');

    const { data: leads, isLoading } = useQuery({
        queryKey: ['myLeads'],
        queryFn: empGetMyLeads,
    });

    const updateStageMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: string }) => empUpdateLead(id, { stage }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myLeads'] });
        }
    });

    const archiveMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => empArchiveLead(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myLeads'] });
            setArchivingLeadId(null);
            setArchiveReason('');
        }
    });

    const convertMutation = useMutation({
        mutationFn: empConvertToStudent,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['myLeads'] });
            queryClient.invalidateQueries({ queryKey: ['myStudents'] });
            // Route to Student Detail (Filing Mode) if data returned student ID
            if (data?.student_id) {
                navigate(`/employee-portal/students/${data.student_id}`);
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    // Group leads by stage
    const groupedLeads = COLUMNS.reduce((acc, col) => {
        // Handle variations where 'PROPOSAL' also means Interested ('QUALIFIED')
        acc[col.id] = (leads || []).filter((l: any) => {
            if (col.id === 'QUALIFIED') return l.stage === 'QUALIFIED' || l.stage === 'PROPOSAL';
            return l.stage === col.id;
        });
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 h-screen flex flex-col pt-[max(2vh,2rem)]">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Lead Board</h1>
                    <p className="text-slate-500 font-medium">Shikari Mode: Track calls, gauge interest, and convert to students.</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-center shadow-sm">
                    <p className="text-2xl font-black font-serif text-slate-900">{leads?.length || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Assigned</p>
                </div>
            </div>

            {leads?.length === 0 ? (
                <div className="flex-1 flex items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <div className="text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 font-serif mb-2">No Leads Assigned</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Marketing leads will appear here automatically when assigned to you.</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-x-auto pb-8 snap-x">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className="snap-start shrink-0 w-[340px] flex flex-col">
                            {/* Column Header */}
                            <div className={clsx("p-4 rounded-t-2xl border-t border-x flex items-center justify-between", column.bg, column.border)}>
                                <div className="flex items-center gap-2">
                                    <column.icon className={clsx("w-5 h-5", column.color)} />
                                    <h3 className={clsx("font-bold", column.color)}>{column.title}</h3>
                                </div>
                                <span className="bg-white px-2 py-0.5 rounded-md text-xs font-black shadow-sm text-slate-700">
                                    {groupedLeads[column.id]?.length || 0}
                                </span>
                            </div>

                            {/* Column Body / Kanban Container */}
                            <div className={clsx("flex-1 p-3 rounded-b-2xl border-x border-b bg-slate-50/50 space-y-3 overflow-y-auto", column.border)}>
                                <AnimatePresence>
                                    {groupedLeads[column.id]?.map((lead: any) => (
                                        <motion.div
                                            key={lead.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-slate-900 leading-tight">
                                                    {lead.first_name} {lead.last_name}
                                                </h4>
                                                {lead.interested_country && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {lead.interested_country}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1 mb-4">
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                )}
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        <span className="truncate">{lead.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* KanBan Actions */}
                                            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                                {column.id === 'NEW' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStageMutation.mutate({ id: lead.id, stage: 'CONTACTED' })}
                                                            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors"
                                                        >
                                                            Mark Contacted
                                                        </button>
                                                        <button
                                                            onClick={() => setArchivingLeadId(lead.id)}
                                                            className="w-full py-1.5 text-slate-400 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <ArchiveX className="w-3 h-3" /> Archive Lead
                                                        </button>
                                                    </>
                                                )}

                                                {column.id === 'CONTACTED' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateStageMutation.mutate({ id: lead.id, stage: 'QUALIFIED' })}
                                                            className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-colors"
                                                        >
                                                            Interested
                                                        </button>
                                                        <button
                                                            onClick={() => setArchivingLeadId(lead.id)}
                                                            className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <ArchiveX className="w-3 h-3" /> Archive
                                                        </button>
                                                    </div>
                                                )}

                                                {column.id === 'QUALIFIED' && (
                                                    <>
                                                        <button
                                                            onClick={() => convertMutation.mutate(lead.id)}
                                                            className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-black rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            Convert to Student
                                                        </button>
                                                        <p className="text-[9px] text-center text-slate-400 font-medium">Creates filing profile & document vault</p>
                                                    </>
                                                )}

                                                {column.id === 'LOST' && (
                                                    <button
                                                        onClick={() => updateStageMutation.mutate({ id: lead.id, stage: 'NEW' })}
                                                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                                                    >
                                                        Retry / Reopen
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {groupedLeads[column.id]?.length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Archive Lead Modal */}
            <AnimatePresence>
                {archivingLeadId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                                    <ArchiveX className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 font-serif">Archive Lead</h3>
                                    <p className="text-sm text-slate-500 font-medium">This will remove the lead from your board.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Archive Reason</span>
                                    <textarea
                                        value={archiveReason}
                                        onChange={(e) => setArchiveReason(e.target.value)}
                                        placeholder="Why is this lead being archived? (e.g., Not answering, Not interested anymore, Fake number)"
                                        className="mt-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium resize-none"
                                        rows={4}
                                        required
                                    />
                                </label>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setArchivingLeadId(null);
                                            setArchiveReason('');
                                        }}
                                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                        disabled={archiveMutation.isPending}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (archiveReason.trim()) {
                                                archiveMutation.mutate({ id: archivingLeadId, reason: archiveReason });
                                            }
                                        }}
                                        disabled={!archiveReason.trim() || archiveMutation.isPending}
                                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {archiveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Archive Lead'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmpLeads;
