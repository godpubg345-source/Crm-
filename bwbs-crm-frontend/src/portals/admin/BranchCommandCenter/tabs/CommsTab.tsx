import { useQuery } from '@tanstack/react-query';
import { Phone, FileText, MessageSquare, Zap, ArrowLeft, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { getCommunications } from '../../../../services/communications';
import type { CommunicationLog } from '../../../../services/communications';
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
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Communications</h2>
                    <p className="text-xs text-slate-500 mt-2">Messages and templates for this branch</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBroadcast}
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold hover:bg-[#7c3aed] transition-all"
                    >
                        Broadcast Message
                    </button>
                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-semibold hover:border-[#7c3aed]/20 transition-all">
                        Manage Templates
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-semibold text-slate-400">Recent interactions</h4>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-semibold text-slate-400">Live</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {logs.map((log: CommunicationLog) => (
                            <div key={log.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#7c3aed]/20 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        log.direction === 'INBOUND' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {getIcon(log.communication_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-slate-900 truncate">{log.student_details?.full_name || 'Anonymous Student'}</h5>
                                            <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2">{log.summary}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-semibold text-slate-300">{log.communication_type_display}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[11px] font-semibold text-slate-300">{log.direction_display}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[11px] font-semibold text-[#7c3aed]">{log.logged_by_details?.first_name || 'System'}</span>
                                        </div>
                                    </div>
                                    <button className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="p-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                <p className="text-xs font-semibold text-slate-400">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <MessageSquare className="w-32 h-32" />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-8 relative z-10">Channels</h4>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'WhatsApp', value: 65, color: 'bg-emerald-400' },
                                { label: 'Email', value: 25, color: 'bg-indigo-400' },
                                { label: 'Voice Calls', value: 10, color: 'bg-rose-400' }
                            ].map((channel, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
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

                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-semibold text-slate-300 mb-8">Quick filters</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#7c3aed]/20 transition-all text-left group">
                                <Zap className="w-5 h-5 text-amber-500 mb-3 transition-transform" />
                                <p className="text-[11px] font-semibold">Intake 2025</p>
                                <p className="text-[11px] text-slate-500 mt-1">12 Actions</p>
                            </button>
                            <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#7c3aed]/20 transition-all text-left group">
                                <ShieldAlert className="w-5 h-5 text-rose-500 mb-3 transition-transform" />
                                <p className="text-[11px] font-semibold">Visas Urgent</p>
                                <p className="text-[11px] text-slate-500 mt-1">5 Actions</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommsTab;
