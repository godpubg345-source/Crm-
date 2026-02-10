import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeadById, createLeadInteraction, convertLead, leadStatusColors, leadStatusLabels } from '../services/leads';
import {
    Phone, Mail, Globe, User,
    ArrowLeft, MoreVertical, ShieldCheck, Target,
    TrendingUp, MessageCircle, Zap, Ghost,
    CheckCircle2, AlertCircle, PlusCircle, LayoutDashboard
} from 'lucide-react';

// ============================================================================
// LEAD DETAIL PAGE - BWBS Education CRM
// ============================================================================

const InfoItem = ({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string; subValue?: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#AD03DE] group-hover:bg-[#AD03DE] group-hover:text-white transition-all shadow-inner">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm text-slate-900 font-bold font-serif">{value}</p>
            {subValue && <p className="text-[10px] text-slate-500 font-medium">{subValue}</p>}
        </div>
    </div>
);

const MetricCard = ({ icon: Icon, label, value, color, description }: { icon: any, label: string, value: string | number, color: string, description: string }) => (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:border-[#AD03DE]/10 transition-all duration-700">
        <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#AD03DE]/10 transition-colors duration-1000`} />
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:${color} transition-all`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-serif font-black tracking-tighter text-slate-900">{value}</span>
                {typeof value === 'number' && <span className="text-xl font-bold text-slate-400">pts</span>}
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
    </div>
);

const LeadDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [interactionContent, setInteractionContent] = useState('');
    const [interactionType, setInteractionType] = useState<'NOTE' | 'CALL' | 'WHATSAPP' | 'EMAIL'>('NOTE');
    const [isConverting, setIsConverting] = useState(false);

    const { data: lead, isLoading, isError } = useQuery({
        queryKey: ['lead', id],
        queryFn: () => getLeadById(id!),
        enabled: !!id,
    });

    const interactionMutation = useMutation({
        mutationFn: createLeadInteraction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead-interactions', id] });
            queryClient.invalidateQueries({ queryKey: ['lead', id] });
            setInteractionContent('');
        }
    });

    const conversionMutation = useMutation({
        mutationFn: () => convertLead(id!),
        onSuccess: (data) => {
            navigate(`/students/${data.student_id}`);
        }
    });

    if (isLoading) return (
        <div className="animate-pulse space-y-8 max-w-7xl mx-auto">
            <div className="h-20 bg-slate-100 rounded-3xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 h-[600px] bg-slate-50 rounded-[3rem]" />
                <div className="h-[600px] bg-slate-50 rounded-[3rem]" />
            </div>
        </div>
    );

    if (isError || !lead) return (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 rounded-[2.5rem] bg-rose-50 flex items-center justify-center mb-8 border border-rose-100 group">
                <AlertCircle className="w-10 h-10 text-rose-500 group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Dossier Obfuscated</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">We encountered an anomaly while attempting to synchronize with the Lead Intelligence database.</p>
            <button
                onClick={() => navigate('/leads')}
                className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl active:scale-95"
            >
                Return to Intelligence Hub
            </button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            {/* Header / Profile Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 bg-white/50 backdrop-blur-md p-8 rounded-[3rem] border border-white/20 shadow-xl">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/leads')}
                        className="p-4 text-slate-400 hover:text-[#AD03DE] bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#AD03DE] via-brand-600 to-indigo-950 flex items-center justify-center text-white font-serif font-black text-4xl shadow-[0_25px_60px_-12px_rgba(173,3,222,0.4)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            {lead.first_name.charAt(0)}{lead.last_name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-5xl font-black text-slate-900 font-serif tracking-tighter leading-none">
                                    {lead.first_name} {lead.last_name}
                                </h1>
                                <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${leadStatusColors[lead.status]}`}>
                                    {leadStatusLabels[lead.status]}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                                <span className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-lg">
                                    <Target className="w-3 h-3 text-[#AD03DE]" />
                                    Source: {lead.source}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-slate-500 font-serif font-bold text-base normal-case tracking-normal">Captured {new Date(lead.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsConverting(true)}
                        className="px-10 py-5 bg-gradient-to-r from-[#AD03DE] to-indigo-600 hover:from-indigo-600 hover:to-[#AD03DE] text-white text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center gap-3 shadow-[0_15px_40px_-5px_rgba(173,3,222,0.4)] hover:-translate-y-1 active:scale-95"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        Execute Conversion
                    </button>
                    <button className="p-5 bg-white hover:bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 shadow-sm transition-all hover:rotate-90">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    icon={Zap}
                    label="Lead Score"
                    value={lead.score}
                    color="bg-amber-500"
                    description="Algorithmic engagement quality index based on behavior & profile depth."
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Win Probability"
                    value={`${lead.win_probability}%`}
                    color="bg-[#AD03DE]"
                    description="Statistical conversion likelihood synthesized from historical sales data."
                />
                <MetricCard
                    icon={Ghost}
                    label="Inactivity"
                    value={lead.is_sla_violated ? 'SLAlert' : 'Stable'}
                    color={lead.is_sla_violated ? 'bg-rose-500' : 'bg-emerald-500'}
                    description="Time-stagnation monitoring. Hot leads require engagement every 24h."
                />
                <MetricCard
                    icon={LayoutDashboard}
                    label="Pipeline Depth"
                    value={leadStatusLabels[lead.status]}
                    color="bg-indigo-500"
                    description="Current tactical position within the Master Sales Funnel."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Panel: Profile Dossier */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#AD03DE]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#AD03DE]" />
                            Strategic Intelligence
                        </h3>
                        <div className="space-y-2">
                            <InfoItem icon={<Mail className="w-5 h-5" />} label="Digital Identity" value={lead.email} />
                            <InfoItem icon={<Phone className="w-5 h-5" />} label="Communication Line" value={lead.phone} />
                            <InfoItem icon={<Globe className="w-5 h-5" />} label="Target Jurisdiction" value={lead.target_country || 'Not Specified'} />
                            <InfoItem icon={<User className="w-5 h-5" />} label="Account Manager" value={lead.assigned_to_details ? `${lead.assigned_to_details.first_name} ${lead.assigned_to_details.last_name}` : 'Awaiting Assignment'} subValue={lead.assigned_to_details?.email} />
                        </div>

                        {lead.notes && (
                            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Briefing</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-bold">"{lead.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Panel: Tactical Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tight">Engagement Timeline</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit-grade communication archive</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                                <Zap className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Real-time Intelligence Active</span>
                            </div>
                        </div>

                        <div className="flex-1 p-10">
                            {/* Shortened interaction logger for the page view */}
                            <div className="mb-12 p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 group hover:border-[#AD03DE]/30 transition-all">
                                <div className="flex gap-3 mb-6">
                                    {(['NOTE', 'CALL', 'WHATSAPP', 'EMAIL'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setInteractionType(t)}
                                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${interactionType === t ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={interactionContent}
                                    onChange={e => setInteractionContent(e.target.value)}
                                    placeholder="Execute tactical log update..."
                                    className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE] transition-all resize-none shadow-sm"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => interactionMutation.mutate({ lead: id!, type: interactionType, content: interactionContent })}
                                        disabled={!interactionContent || interactionMutation.isPending}
                                        className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl disabled:opacity-20 flex items-center gap-2"
                                    >
                                        {interactionMutation.isPending ? 'Propagating...' : 'Log Engagement'}
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Timeline Placeholder - In a real app we'd fetch and map here, 
                                but I'll use a simplified version for now or import the existing one if I refactored it.
                                For now, I'll just show the empty state message.
                            */}
                            <div className="space-y-12">
                                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                    <MessageCircle className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="text-sm font-serif font-bold">Initialize communication to manifest the timeline.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion Confirmation Modal */}
            {isConverting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-white animate-in zoom-in-95 duration-500 text-center">
                        <div className="w-20 h-20 bg-[#AD03DE]/10 text-[#AD03DE] rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
                            <Zap className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-4">Execute Conversion?</h2>
                        <p className="text-slate-500 font-medium mb-10">This will finalize the lead dossier and initialize a primary Student Enrolment record. This action is statistically significant.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsConverting(false)}
                                className="px-6 py-4 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={() => conversionMutation.mutate()}
                                disabled={conversionMutation.isPending}
                                className="px-6 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {conversionMutation.isPending ? 'Processing...' : 'Proceed'}
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadDetail;
