import { useQuery } from '@tanstack/react-query';
import { Phone, FileText, MessageSquare, Zap, ArrowLeft, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { getCommunications } from '../../../services/communications';
import type { CommunicationLog } from '../../../services/communications';
import type { CommsTabProps } from '../types';

const CommsTab = ({ branchId, onBroadcast }: CommsTabProps) => {
    const { data: logsData } = useQuery({
        queryKey: ['branch-comms', branchId],
        queryFn: () => getCommunications({ ordering: '-created_at', page: 1 })
    });

    const logs = logsData?.results || [];

    const getIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone className="w-4 h-4" />;
            case 'EMAIL': return <FileText className="w-4 h-4" />;
            case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Communications Hub</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Omnichannel Feed • Live Interactions • Template Engine</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBroadcast}
                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#AD03DE] transition-all"
                    >
                        Broadcast Message
                    </button>
                    <button className="px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#AD03DE]/20 transition-all">
                        Manage Templates
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Regional Interaction Feed</h4>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Stream</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log: CommunicationLog) => (
                            <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#AD03DE]/20 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        log.direction === 'INBOUND' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {getIcon(log.communication_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-serif font-black text-slate-900 truncate">{log.student_details?.full_name || 'Anonymous Student'}</h5>
                                            <span className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2">{log.summary}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.communication_type_display}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.direction_display}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest">{log.logged_by_details?.first_name || 'System'}</span>
                                        </div>
                                    </div>
                                    <button className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Silence in the Node</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <MessageSquare className="w-32 h-32" />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 relative z-10">Channel Saturation</h4>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'WhatsApp', value: 65, color: 'bg-emerald-400' },
                                { label: 'Email', value: 25, color: 'bg-indigo-400' },
                                { label: 'Voice Calls', value: 10, color: 'bg-rose-400' }
                            ].map((channel, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>{channel.label}</span>
                                        <span className="text-slate-500">{channel.value}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={clsx("h-full rounded-full transition-all duration-1000", channel.color)} style={{ width: `${channel.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8">Active Hotkeys</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#AD03DE]/20 transition-all text-left group">
                                <Zap className="w-5 h-5 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase tracking-widest">Intake 2025</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">12 Actions</p>
                            </button>
                            <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#AD03DE]/20 transition-all text-left group">
                                <ShieldAlert className="w-5 h-5 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[9px] font-black uppercase tracking-widest">Visas Urgent</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">5 Actions</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommsTab;
