import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCommunication,
    getStudentCommunications,
    type CommunicationCreateData,
    type CommunicationDirection,
    type CommunicationLog,
    type CommunicationType,
} from '../../services/communications';

// ============================================================================
// COMMUNICATIONS TAB - BWBS Education CRM
// ============================================================================

interface CommunicationsTabProps {
    studentId: string;
}

const typeConfig: Record<CommunicationType, { label: string; color: string; icon: React.ReactNode }> = {
    CALL: {
        label: 'Voice Consult',
        color: 'bg-blue-50 text-blue-600 border-blue-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        )
    },
    EMAIL: {
        label: 'Official Email',
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        )
    },
    SMS: {
        label: 'Direct SMS',
        color: 'bg-amber-50 text-amber-600 border-amber-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m9-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    MEETING: {
        label: 'Executive Session',
        color: 'bg-purple-50 text-purple-600 border-purple-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    WHATSAPP: {
        label: 'WhatsApp Chat',
        color: 'bg-green-50 text-green-600 border-green-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25-9 3.694-9 8.25c0 1.618.504 3.12 1.364 4.385l-1.014 3.615 3.733-.981A9.011 9.011 0 0012 20.25z" />
            </svg>
        )
    },
    OTHER: {
        label: 'Misc Artifact',
        color: 'bg-slate-50 text-slate-600 border-slate-100',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        )
    },
};

const CommunicationsTab = ({ studentId }: CommunicationsTabProps) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['communications', studentId],
        queryFn: () => getStudentCommunications(studentId),
    });

    const createMutation = useMutation({
        mutationFn: createCommunication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communications', studentId] });
            setIsModalOpen(false);
        },
    });

    const logs = data?.results || [];

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-border" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12 bg-rose-50/30 rounded-3xl border border-rose-100">
                <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px]">Sync Protocol Failed</p>
                <p className="text-rose-400 text-sm mt-1">Unable to retrieve student dossier history.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 font-bold">Conversational Ledger</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Timeline of strategic engagements</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#AD03DE] hover:bg-[#9302bb] text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-[#AD03DE]/20 active:scale-95 group"
                >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Log Engagement
                </button>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-8 border border-slate-100 text-[#AD03DE] shadow-xl group hover:scale-110 transition-all duration-700">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 font-bold mb-2">The Dossier is Silent</h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                        No strategic communications recorded. Initialize the timeline by logging your first client touchpoint.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-slate-100 via-slate-200 to-transparent" />

                    {logs.map((log: CommunicationLog) => {
                        const config = typeConfig[log.communication_type] || typeConfig.OTHER;
                        return (
                            <div key={log.id} className="relative pl-14 group">
                                {/* Timeline Node */}
                                <div className={`absolute left-0 top-6 w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm group-hover:shadow-md group-hover:border-[#AD03DE]/30 transition-all duration-500 ${config.color.split(' ')[1]}`}>
                                    {config.icon}
                                </div>

                                <div className="p-6 rounded-[2rem] border border-border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group-hover:border-[#AD03DE]/10 overflow-hidden relative">
                                    {/* Corner Decoration */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${config.color.split(' ')[0]}`} />

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-widest ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${log.direction === 'OUTBOUND' ? 'bg-indigo-400' : 'bg-rose-400'}`} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                    {log.direction_display || log.direction}
                                                </span>
                                            </div>
                                            {log.subject && (
                                                <h4 className="text-base font-serif font-bold text-slate-800 font-bold">
                                                    {log.subject}
                                                </h4>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                            {log.summary}
                                        </p>

                                        {(log.next_action || log.follow_up_at) && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {log.next_action && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter block mb-0.5">Next Strategic Move</span>
                                                            <p className="text-[11px] font-bold text-slate-600 leading-tight">{log.next_action}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {log.follow_up_at && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter block mb-0.5">Scheduled Follow-up</span>
                                                            <p className="text-[11px] font-bold text-slate-600 leading-tight">
                                                                {new Date(log.follow_up_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shadow-inner overflow-hidden border border-white">
                                            <span className="text-[8px] font-bold text-slate-400">
                                                {log.logged_by_details?.first_name?.[0] || 'S'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            Handled by {log.logged_by_details ? `${log.logged_by_details.first_name} ${log.logged_by_details.last_name}` : 'System Protocol'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <LogCommunicationModal
                    studentId={studentId}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(payload) => createMutation.mutate(payload)}
                    isSubmitting={createMutation.isPending}
                />
            )}
        </div>
    );
};

interface LogModalProps {
    studentId: string;
    onClose: () => void;
    onSubmit: (data: CommunicationCreateData) => void;
    isSubmitting: boolean;
}

const LogCommunicationModal = ({ studentId, onClose, onSubmit, isSubmitting }: LogModalProps) => {
    const [formData, setFormData] = useState<CommunicationCreateData>({
        student: studentId,
        communication_type: 'CALL',
        direction: 'OUTBOUND',
        subject: '',
        summary: '',
        next_action: '',
        follow_up_at: null,
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 font-bold">Log Engagement</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Archive new strategic touchpoint</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modal Point</label>
                            <select
                                value={formData.communication_type}
                                onChange={(e) => setFormData({ ...formData, communication_type: e.target.value as CommunicationType })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="CALL">Voice Call</option>
                                <option value="EMAIL">Email Dispatch</option>
                                <option value="SMS">Direct Message</option>
                                <option value="MEETING">Executive Session</option>
                                <option value="WHATSAPP">WhatsApp Flow</option>
                                <option value="OTHER">Other Artifact</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Flow Direction</label>
                            <select
                                value={formData.direction}
                                onChange={(e) => setFormData({ ...formData, direction: e.target.value as CommunicationDirection })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="OUTBOUND">Outbound Consult</option>
                                <option value="INBOUND">Inbound Inquiry</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Matter</label>
                        <input
                            value={formData.subject || ''}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Primary focus of this engagement"
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-serif font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Strategic Summary *</label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            rows={3}
                            placeholder="Detailed artifacts and outcomes..."
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all resize-none leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Next Action</label>
                            <input
                                value={formData.next_action || ''}
                                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                                placeholder="Mandatory follow-up"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Follow-up At</label>
                            <input
                                type="datetime-local"
                                value={formData.follow_up_at || ''}
                                onChange={(e) => setFormData({ ...formData, follow_up_at: e.target.value || null })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-xs focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                        >
                            Abort Entry
                        </button>
                        <button
                            onClick={() => onSubmit(formData)}
                            disabled={isSubmitting || !formData.summary.trim()}
                            className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95 flex items-center gap-3"
                        >
                            {isSubmitting ? 'Archiving...' : (
                                <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Commit to Dossier
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationsTab;
