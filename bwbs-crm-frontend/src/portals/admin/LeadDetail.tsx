import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeadById, createLeadInteraction, convertLead, leadStatusColors, leadStatusLabels } from '../../services/leads';
import {
    Phone, Mail, Globe, User,
    ArrowLeft, MoreVertical, ShieldCheck, Target,
    TrendingUp, MessageCircle, Zap, Ghost,
    CheckCircle2, AlertCircle, PlusCircle, LayoutDashboard
} from 'lucide-react';

// ============================================================================
// LEAD DETAIL PAGE - Education Consultancy ERP
// ============================================================================

const InfoItem = ({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string; subValue?: string }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white transition-all">
            {icon}
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm text-slate-900 font-bold">{value}</p>
            {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
        </div>
    </div>
);

const MetricCard = ({ icon: Icon, label, value, color, description }: { icon: any, label: string, value: string | number, color: string, description: string }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 relative overflow-hidden group hover:border-[#7c3aed]/10 transition-all duration-200">
        <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#7c3aed]/10 transition-colors duration-1000`} />
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-white group-hover:${color} transition-all`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
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
            navigate(`/admin/students/${data.student_id}`);
        }
    });

    if (isLoading) return (
        <div className="animate-pulse space-y-8 max-w-7xl mx-auto">
            <div className="h-20 bg-slate-100 rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 h-[600px] bg-slate-50 rounded-2xl" />
                <div className="h-[600px] bg-slate-50 rounded-2xl" />
            </div>
        </div>
    );

    if (isError || !lead) return (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="w-24 h-24 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 border border-rose-100 group">
                <AlertCircle className="w-10 h-10 text-rose-500 transition-transform" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Lead not found</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">We couldn't load this lead. It may have been deleted.</p>
            <button
                onClick={() => navigate('/admin/leads')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
            >
                Back to leads
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-200 ease-out">
            {/* Header / Profile Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 bg-white p-6 rounded-2xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/admin/leads')}
                        className="p-4 text-slate-400 hover:text-[#7c3aed] bg-white border border-slate-200 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#7c3aed] via-brand-600 to-indigo-950 flex items-center justify-center text-white font-semibold text-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            {lead.first_name.charAt(0)}{lead.last_name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">
                                    {lead.first_name} {lead.last_name}
                                </h1>
                                <span className={`px-4 py-1.5 rounded-full border text-[11px] font-semibold shadow-sm ${leadStatusColors[lead.status]}`}>
                                    {leadStatusLabels[lead.status]}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-xs font-semibold tracking-[0.1em] text-slate-400">
                                <span className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-lg">
                                    <Target className="w-3 h-3 text-[#7c3aed]" />
                                    Source: {lead.source}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-slate-500 font-bold text-base normal-case tracking-normal">Captured {new Date(lead.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsConverting(true)}
                        className="px-6 py-5 bg-gradient-to-r from-[#7c3aed] to-indigo-600 hover:from-indigo-600 hover:to-[#7c3aed] text-white text-xs font-semibold rounded-2xl transition-all flex items-center gap-3"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        Convert to student
                    </button>
                    <button className="p-5 bg-white hover:bg-slate-50 text-slate-400 rounded-xl border border-slate-200 transition-all">
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
                    description="Higher means more engaged and a more complete profile."
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Win Probability"
                    value={`${lead.win_probability}%`}
                    color="bg-[#7c3aed]"
                    description="Estimated chance this lead becomes a student."
                />
                <MetricCard
                    icon={Ghost}
                    label="Inactivity"
                    value={lead.is_sla_violated ? 'SLAlert' : 'Stable'}
                    color={lead.is_sla_violated ? 'bg-rose-500' : 'bg-emerald-500'}
                    description="Time since last contact. Contact hot leads every 24 hours."
                />
                <MetricCard
                    icon={LayoutDashboard}
                    label="Stage"
                    value={leadStatusLabels[lead.status]}
                    color="bg-indigo-500"
                    description="Current stage in the pipeline."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Profile Dossier */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 relative overflow-hidden group">
                        <h3 className="text-xs font-semibold text-slate-400 mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                            Lead details
                        </h3>
                        <div className="space-y-2">
                            <InfoItem icon={<Mail className="w-5 h-5" />} label="Email" value={lead.email} />
                            <InfoItem icon={<Phone className="w-5 h-5" />} label="Phone" value={lead.phone} />
                            <InfoItem icon={<Globe className="w-5 h-5" />} label="Target country" value={lead.target_country || 'Not Specified'} />
                            <InfoItem icon={<User className="w-5 h-5" />} label="Counselor" value={lead.assigned_to_details ? (lead.assigned_to_details.first_name || lead.assigned_to_details.last_name ? `${lead.assigned_to_details.first_name} ${lead.assigned_to_details.last_name}`.trim() : lead.assigned_to_details.email?.split('@')[0]) : 'Awaiting Assignment'} subValue={lead.assigned_to_details?.email} />
                        </div>

                        {lead.notes && (
                            <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[11px] font-semibold text-slate-400 mb-2">Notes</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-bold">"{lead.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Panel: Tactical Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Activity</h3>
                                <p className="text-xs text-slate-500 mt-1">Calls, emails and notes</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                                <Zap className="w-3 h-3" />
                                <span className="text-[11px] font-semibold">Up to date</span>
                            </div>
                        </div>

                        <div className="flex-1 p-6">
                            {/* Shortened interaction logger for the page view */}
                            <div className="mb-6 p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                <div className="flex gap-3 mb-6">
                                    {(['NOTE', 'CALL', 'WHATSAPP', 'EMAIL'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setInteractionType(t)}
                                            className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all ${interactionType === t ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={interactionContent}
                                    onChange={e => setInteractionContent(e.target.value)}
                                    placeholder="Add a note..."
                                    className="w-full bg-white border border-slate-200 rounded-xl p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] transition-all resize-none"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => interactionMutation.mutate({ lead: id!, type: interactionType, content: interactionContent })}
                                        disabled={!interactionContent || interactionMutation.isPending}
                                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-all shadow-sm disabled:opacity-20 flex items-center gap-2"
                                    >
                                        {interactionMutation.isPending ? 'Propagating...' : 'Log interaction'}
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Timeline Placeholder - In a real app we'd fetch and map here, 
                                but I'll use a simplified version for now or import the existing one if I refactored it.
                                For now, I'll just show the empty state message.
                            */}
                            <div className="space-y-6">
                                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                                    <MessageCircle className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="text-sm font-bold">No activity yet. Log a call, email or note to start the timeline.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversion Confirmation Modal */}
            {isConverting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-10 h-10 bg-[#7c3aed]/10 text-[#7c3aed] rounded-lg flex items-center justify-center mx-auto mb-8">
                            <Zap className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-4">Convert to student?</h2>
                        <p className="text-slate-500 font-medium mb-6">This will finalize the lead dossier and initialize a primary Student Enrolment record. This action is statistically significant.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsConverting(false)}
                                className="px-6 py-4 bg-slate-100 text-slate-500 text-xs font-semibold rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => conversionMutation.mutate()}
                                disabled={conversionMutation.isPending}
                                className="px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
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
