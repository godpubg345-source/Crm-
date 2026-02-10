import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getLeadInteractions,
    createLeadInteraction,
    type Lead,
    type InteractionType,
} from '../../services/leads';
import VoiceInteractionRecorder from './VoiceInteractionRecorder';
import { getCurrentUser } from '../../services/auth';

interface LeadInteractionTimelineProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onInteractionAdded: () => void;
}

const LeadInteractionTimeline = ({ lead, isOpen, onClose, onInteractionAdded }: LeadInteractionTimelineProps) => {
    const queryClient = useQueryClient();

    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const { data: interactions = [], isLoading } = useQuery({
        queryKey: ['lead-interactions', lead.id],
        queryFn: () => getLeadInteractions(lead.id),
        enabled: isOpen,
    });

    const mutation = useMutation({
        mutationFn: createLeadInteraction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead-interactions', lead.id] });
            onInteractionAdded();
        },
    });

    const [content, setContent] = useState('');
    const [type, setType] = useState<InteractionType>('NOTE');
    const [isRecording, setIsRecording] = useState(false);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-xl h-full shadow-[-30px_0_80px_rgba(0,0,0,0.1)] border-l border-slate-100 flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">Interaction Feed</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                            {lead.first_name} {lead.last_name} &bull; {lead.priority_display}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all border border-slate-100 shadow-sm active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 premium-scrollbar">
                    {/* Log New Interaction */}
                    <div className="p-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm mb-12">
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Log Interaction Event</label>
                        <div className="flex gap-2 mb-4">
                            {(['NOTE', 'CALL', 'WHATSAPP', 'EMAIL', 'MEETING'] as InteractionType[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all border ${type === t
                                        ? 'bg-[#AD03DE] text-white border-[#AD03DE] shadow-lg shadow-[#AD03DE]/20'
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-[#AD03DE]/30'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {isRecording ? (
                            <VoiceInteractionRecorder
                                onRecordingComplete={(blob) => {
                                    setAudioBlob(blob);
                                    setIsRecording(false);
                                    if (!content) setContent('Voice Note');
                                }}
                                onCancel={() => setIsRecording(false)}
                            />
                        ) : (
                            <>
                                {audioBlob && (
                                    <div className="mb-4 p-4 bg-[#AD03DE]/5 border border-[#AD03DE]/20 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#AD03DE] flex items-center justify-center text-white">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                            </div>
                                            <span className="text-xs font-bold text-[#AD03DE]">Voice Note Attached</span>
                                        </div>
                                        <button
                                            onClick={() => setAudioBlob(null)}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Briefly describe the outcome of this engagement..."
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE] transition-all resize-none mb-4"
                                />
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setIsRecording(true)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                        Record Voice
                                    </button>
                                    <button
                                        onClick={() => {
                                            const link = `${window.location.origin}/booking/${getCurrentUser()?.id}?leadId=${lead.id}`;
                                            navigator.clipboard.writeText(link);
                                            alert('Booking link copied to clipboard!');
                                        }}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Copy Booking Link
                                    </button>
                                </div>
                                <button
                                    onClick={() => mutation.mutate({ lead: lead.id, type, content, audio_file: audioBlob || undefined })}
                                    disabled={mutation.isPending || (!content && !audioBlob)}
                                    className="w-full py-4 bg-slate-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95"
                                >
                                    {mutation.isPending ? 'Propagating Event...' : 'Commit to Timeline'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Timeline visualization */}
                    <div className="relative pl-8 border-l-2 border-slate-50 ml-4 space-y-12">
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                                    <div className="flex-1 bg-slate-50 h-24 rounded-2xl" />
                                </div>
                            ))
                        ) : interactions.length === 0 ? (
                            <div className="py-12 text-center -ml-8">
                                <p className="text-slate-400 text-sm font-bold font-serif">Original silence. Log the first engagement to begin the legacy.</p>
                            </div>
                        ) : interactions.map((interaction) => (
                            <div key={interaction.id} className="relative group">
                                {/* Timeline Dot/Icon */}
                                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center text-[#AD03DE] shadow-sm transform group-hover:scale-110 transition-transform">
                                    <InteractionIcon type={interaction.type} className="w-4 h-4" />
                                </div>

                                <div className="p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-500">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">{interaction.type_display}</span>
                                            <span className="text-sm font-bold text-slate-900 font-serif">by {interaction.staff_details?.first_name || 'System'}</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {new Date(interaction.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
                                        {interaction.content}
                                    </p>
                                    {interaction.audio_file && (
                                        <div className="mt-4 p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                                            <audio
                                                src={`${import.meta.env.VITE_API_URL}${interaction.audio_file}`}
                                                controls
                                                className="w-full h-8"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InteractionIcon = ({ type, className }: { type: InteractionType, className?: string }) => {
    switch (type) {
        case 'CALL':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 012 5z" /></svg>;
        case 'WHATSAPP':
            return <svg className={className} fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.6-44.8-27.7-16.6-14.8-27.8-33-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg>;
        case 'EMAIL':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>;
        case 'MEETING':
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        default:
            return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    }
};

export default LeadInteractionTimeline;
