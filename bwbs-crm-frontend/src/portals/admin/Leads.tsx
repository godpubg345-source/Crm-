import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    getLeads,
    createLead,
    convertLead,
    updateLead,
    type Lead,
    type LeadStatus,
    type LeadSource,
    type LeadCreateData,
    leadStatusColors,
    leadStatusLabels,
    checkDuplicateLead,
    bulkLeadAction,
    getWhatsAppTemplatesList
} from '../../services/leads';
import { getCounselors } from '../../services/users';
import { getCurrentUser } from '../../services/auth';
import LeadInteractionTimeline from '../../components/leads/LeadInteractionTimeline';
import WhatsAppAutomationDrawer from '../../components/leads/WhatsAppAutomationDrawer';
import WhatsAppMagicDispatcher from '../../components/leads/WhatsAppMagicDispatcher';
import { type WhatsAppTemplate } from '../../services/leads';
import {
    Plus,
    ArrowUpRight,
    Zap,
    Activity,
    Clock,
    ShieldCheck,
    TrendingUp,
    AlertCircle,
    BarChart3,
    X,
    BadgeCheck,
    Loader2,
    Users2,
    MessageSquare,
    Mail,
    ArchiveX
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// ============================================================================
// LEADS PIPELINE - CONVERSION INTELLIGENCE HUB
// ============================================================================

const Leads = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<LeadStatus | 'ALL'>('ALL');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedLeadForWA, setSelectedLeadForWA] = useState<Lead | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const user = getCurrentUser();
    const canAssignLeads = user?.role === 'SUPER_ADMIN' || user?.role === 'COUNTRY_MANAGER' || user?.role === 'BRANCH_MANAGER';

    const { data, isLoading } = useQuery({
        queryKey: ['leads', activeFilter],
        queryFn: () => {
            // If the filter is 'ARCHIVED', we need a new way to fetch them, 
            // since the backend currently returns active by default if we filter, 
            // so we might need to adjust or pass a specific param. 
            // The LeadViewSet by default doesn't filter out is_active=False for admins,
            // so we can just fetch all and filter client-side for now for simplicity,
            // or pass `is_active=false` to the API if supported.
            // Let's rely on standard getLeads and filter below for now, or assume the backend sends them all to admins.
            return getLeads(activeFilter === 'ALL' || activeFilter === 'ARCHIVED' ? undefined : activeFilter);
        }
    });

    const { data: counselors = [] } = useQuery({
        queryKey: ['counselors'],
        queryFn: getCounselors,
        enabled: canAssignLeads,
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const convertMutation = useMutation({
        mutationFn: convertLead,
        onSuccess: (response) => {
            showToast('Lead converted successfully! Redirecting to student...', 'success');
            navigate(`/admin/students/${response.student_id}`);
        },
        onError: () => {
            showToast('Failed to convert lead.', 'error');
        }
    });

    const assignMutation = useMutation({
        mutationFn: ({ id, assigned_to }: { id: string; assigned_to: string | null }) =>
            updateLead(id, { assigned_to }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
        onError: () => {
            showToast('Failed to assign counselor.', 'error');
        },
    });

    const bulkMutation = useMutation({
        mutationFn: bulkLeadAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setSelectedIds([]);
            setBulkActionType(null);
            showToast('Bulk action completed successfully!', 'success');
        },
        onError: () => {
            showToast('Bulk action failed.', 'error');
        }
    });

    const [bulkActionType, setBulkActionType] = useState<'ASSIGN' | 'STATUS_UPDATE' | 'WHATSAPP_TEMPLATE' | null>(null);
    const [selectedDispatcherTemplate, setSelectedDispatcherTemplate] = useState<WhatsAppTemplate | null>(null);

    const { data: bulkTemplates = [] } = useQuery({
        queryKey: ['bulk-whatsapp-templates-v3'],
        queryFn: getWhatsAppTemplatesList,
        enabled: bulkActionType === 'WHATSAPP_TEMPLATE',
    });

    const handleConvert = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to convert this lead to a student?')) {
            convertMutation.mutate(id);
        }
    };

    const handleAssign = (id: string, counselorId: string | null) => {
        assignMutation.mutate({ id, assigned_to: counselorId });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    let leads = data?.results || [];

    // Client-side filtering for ARCHIVED vs Active (for Admins)
    if (activeFilter === 'ARCHIVED') {
        leads = leads.filter((l: any) => l.is_active === false);
    } else if (activeFilter !== 'ALL') {
        leads = leads.filter((l: any) => l.is_active !== false); // Hide archived from standard status views
    } else {
        leads = leads.filter((l: any) => l.is_active !== false); // By default, ALL only shows active.
    }

    // Group leads by branch location
    const groupedLeads = leads.reduce((acc: Record<string, typeof leads>, lead: any) => {
        const branchName = lead.branch_name || 'GLOBAL (Unassigned)';
        if (!acc[branchName]) {
            acc[branchName] = [];
        }
        acc[branchName].push(lead);
        return acc;
    }, {});

    // Sort branches alphabetically, put 'GLOBAL (Unassigned)' at the end if you prefer
    const sortedCountries = Object.keys(groupedLeads).sort((a, b) => {
        if (a === 'GLOBAL (Unassigned)') return 1;
        if (b === 'GLOBAL (Unassigned)') return -1;
        return a.localeCompare(b);
    });

    // Branch filter narrows the list; empty = every branch
    const visibleLeads = selectedCountry ? (groupedLeads[selectedCountry] ?? []) : leads;

    const leadStats = [
        { label: 'Total Leads', value: visibleLeads.length.toString(), trend: selectedCountry ? selectedCountry : 'All branches', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Hot Leads', value: visibleLeads.filter(l => l.priority === 'HOT').length.toString(), trend: 'Ready to convert', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Conversion Rate', value: `${visibleLeads.length ? Math.round((visibleLeads.filter(l => l.status === 'CONVERTED').length / visibleLeads.length) * 100) : 0}%`, trend: 'Converted to students', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'New Leads', value: visibleLeads.filter(l => l.status === 'NEW').length.toString(), trend: 'Not contacted yet', icon: ShieldCheck, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6 pb-20">

            {toast && (
                <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-sm text-xs font-semibold animate-in slide-in-from-top-12 duration-500 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {toast.message}
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">All Leads</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your student leads and prospects</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2.5 bg-violet-600 text-white rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead
                </button>
            </div>

            <div className="space-y-6">
                {(
                    // LEADS LIST
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-200">
                        {/* Stats Ledger */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {leadStats.map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100/80 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center border border-white shadow-sm transition-all`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <span className="text-xs font-semibold text-[#7c3aed] opacity-60">{stat.trend}</span>
                                    </div>
                                    <h3 className="text-3xl font-semibold text-slate-900 mb-1">{stat.value}</h3>
                                    <p className="text-[11px] font-semibold text-slate-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters & Control Bar */}
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl border border-slate-100/80">
                            <div className="flex gap-2 overflow-x-auto premium-scrollbar pb-2 md:pb-0">
                                {(['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST', 'ARCHIVED'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveFilter(status)}
                                        className={clsx(
                                            "px-6 py-3 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap",
                                            activeFilter === status
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "bg-white text-slate-600 border border-slate-100 hover:border-[#7c3aed]/30 hover:text-[#7c3aed]"
                                        )}
                                    >
                                        {status === 'ALL' ? 'All' : status === 'ARCHIVED' ? 'Archived / Deleted' : leadStatusLabels[status as LeadStatus]}
                                    </button>
                                ))}
                            </div>
                            {sortedCountries.length > 1 && (
                                <select
                                    value={selectedCountry ?? ''}
                                    onChange={(e) => setSelectedCountry(e.target.value || null)}
                                    className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                                >
                                    <option value="">All branches ({leads.length})</option>
                                    {sortedCountries.map((branch) => (
                                        <option key={branch} value={branch}>{branch} ({groupedLeads[branch].length})</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Main Content Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-slate-100" />
                                ))}
                            </div>
                        ) : visibleLeads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Activity className="w-16 h-16 text-slate-300 mb-6 opacity-20" />
                                <h3 className="text-2xl font-semibold text-slate-400">No leads found</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleLeads.map((lead: any) => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        counselors={counselors}
                                        canAssignLeads={canAssignLeads}
                                        onAssign={handleAssign}
                                        isAssigning={assignMutation.isPending && assignMutation.variables?.id === lead.id}
                                        onConvert={handleConvert}
                                        isConverting={convertMutation.isPending && convertMutation.variables === lead.id}
                                        onInteractionAdded={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
                                        onWhatsAppTrigger={() => setSelectedLeadForWA(lead)}
                                        isSelected={selectedIds.includes(lead.id)}
                                        onSelect={() => toggleSelect(lead.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals and Overlays */}
            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['leads'] });
                    setIsAddModalOpen(false);
                }}
            />
            {selectedLeadForWA && (
                <WhatsAppAutomationDrawer
                    isOpen={!!selectedLeadForWA}
                    onClose={() => setSelectedLeadForWA(null)}
                    lead={selectedLeadForWA}
                />
            )}
            {selectedDispatcherTemplate && (
                <WhatsAppMagicDispatcher
                    isOpen={!!selectedDispatcherTemplate}
                    onClose={() => setSelectedDispatcherTemplate(null)}
                    selectedLeads={leads.filter(l => selectedIds.includes(l.id))}
                    template={selectedDispatcherTemplate}
                />
            )}

            {/* Bulk Action Navigator */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-20 duration-200">
                    <div className="bg-slate-900 border border-white/10 text-white rounded-2xl p-6 flex items-center gap-8 ring-1 ring-white/20">
                        <div className="flex items-center gap-4 px-6 border-r border-white/10">
                            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-lg font-semibold">
                                {selectedIds.length}
                            </div>
                            <span className="text-xs font-semibold text-slate-400">Selected</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => setBulkActionType('ASSIGN')} className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 rounded-2xl transition-all text-xs font-semibold group">
                                <Users2 className="w-4 h-4 text-[#7c3aed] transition-transform" />
                                Reassign
                            </button>
                            <button onClick={() => setBulkActionType('STATUS_UPDATE')} className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 rounded-2xl transition-all text-xs font-semibold group">
                                <Activity className="w-4 h-4 text-amber-500 transition-transform" />
                                Status
                            </button>
                            <button onClick={() => setBulkActionType('WHATSAPP_TEMPLATE')} className="bg-[#128C7E]/10 hover:bg-[#128C7E]/20 text-[#25D366] px-8 py-3 rounded-2xl transition-all text-xs font-semibold border border-[#128C7E]/20 flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 fill-current" />
                                Bulk Message
                            </button>
                            <button onClick={() => setSelectedIds([])} className="ml-4 p-3 hover:bg-red-500/20 text-red-400 rounded-xl transition-all rotate-0 group">
                                <X className="w-5 h-5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Parameter Modal */}
            {bulkActionType && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
                                {bulkActionType === 'ASSIGN' && 'Assign Leads'}
                                {bulkActionType === 'STATUS_UPDATE' && 'Update Status'}
                                {bulkActionType === 'WHATSAPP_TEMPLATE' && 'Bulk WhatsApp'}
                            </h2>
                            <p className="text-xs font-semibold text-slate-400 mt-2 ml-1">Updating {selectedIds.length} Selected Leads</p>
                        </div>

                        <div className="p-6 space-y-8">
                            {bulkActionType === 'ASSIGN' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-semibold text-slate-400 ml-2">Select Counselor</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {counselors.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => bulkMutation.mutate({ lead_ids: selectedIds, action: 'ASSIGN', assigned_to: c.id })}
                                                className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-[#7c3aed]/30 hover:bg-[#7c3aed]/5 transition-all text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white font-semibold">{c.first_name[0]}</div>
                                                    <span className="text-sm font-semibold text-slate-900">{c.first_name} {c.last_name}</span>
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bulkActionType === 'STATUS_UPDATE' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-semibold text-slate-400 ml-2">Select New Status</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as LeadStatus[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => bulkMutation.mutate({ lead_ids: selectedIds, action: 'STATUS_UPDATE', status: s })}
                                                className={clsx(
                                                    "px-6 py-5 rounded-2xl border text-xs font-semibold transition-all text-center",
                                                    leadStatusColors[s]
                                                )}
                                            >
                                                {leadStatusLabels[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bulkActionType === 'WHATSAPP_TEMPLATE' && (
                                <div className="space-y-4">
                                    <label className="text-xs font-semibold text-slate-400 ml-2">Select Template</label>
                                    <div className="space-y-3 max-h-80 overflow-y-auto premium-scrollbar pr-4">
                                        {bulkTemplates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setSelectedDispatcherTemplate(t); setBulkActionType(null); }}
                                                className="w-full p-6 border border-slate-100 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 rounded-2xl text-left transition-all relative group"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#7c3aed] transition-colors">{t.title}</span>
                                                    <span className="text-[11px] font-semibold px-3 py-1 bg-white text-slate-400 rounded-full border border-slate-200">{t.category_display}</span>
                                                </div>
                                                <div className="w-1 h-8 bg-[#7c3aed] absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setBulkActionType(null)} className="px-6 py-4 text-slate-400 font-semibold text-xs hover:text-slate-900 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

const LeadCard = ({ lead, counselors, canAssignLeads, onAssign, isAssigning, onConvert, isConverting, onInteractionAdded, onWhatsAppTrigger, isSelected, onSelect }: {
    lead: Lead;
    counselors: any[];
    canAssignLeads: boolean;
    onAssign: any;
    isAssigning: boolean;
    onConvert: any;
    isConverting: boolean;
    onInteractionAdded: any;
    onWhatsAppTrigger: any;
    isSelected: boolean;
    onSelect: any;
}) => {
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const assignedName = lead.assigned_to_details ? (lead.assigned_to_details.first_name || lead.assigned_to_details.last_name ? `${lead.assigned_to_details.first_name} ${lead.assigned_to_details.last_name}`.trim() : lead.assigned_to_details.email?.split('@')[0]) : 'Unassigned';
    const slaViolated = lead.is_sla_violated;

    return (
        <div className={clsx(
            "bg-white rounded-2xl border-2 p-6 transition-all duration-700 group relative overflow-hidden",
            slaViolated ? 'border-rose-100 bg-rose-50/10 ' : 'border-slate-50 hover:border-[#7c3aed]/30'
        )}>
            <div className={clsx("absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-30 transition-all duration-1000", lead.priority === 'HOT' ? 'bg-rose-500' : 'bg-[#7c3aed]')} />

            {/* Selective Interaction */}
            <div className="absolute top-10 left-10 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onSelect(); }}
                    className={clsx(
                        "w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ",
                        isSelected ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm' : 'bg-white border-slate-100 group-hover:border-[#7c3aed]/50'
                    )}
                >
                    {isSelected && <BadgeCheck className="w-4 h-4" />}
                </button>
            </div>

            {/* SLA Alert Ribbon */}
            {slaViolated && (
                <div className="absolute top-0 right-0 px-8 py-2 bg-rose-500 text-white text-[11px] font-semibold z-30 shadow-sm flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {lead.priority === 'HOT' ? 'GHOST ALERT' : 'SLA BREACH'}
                </div>
            )}

            <div className="flex justify-between items-center mb-8 pl-12">
                <div className="flex gap-2">
                    <span className={clsx("px-4 py-1.5 text-[11px] font-semibold rounded-full border shadow-sm ", leadStatusColors[lead.status])}>
                        {leadStatusLabels[lead.status]}
                    </span>
                    {lead.is_active === false && (
                        <span className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-full shadow-sm flex items-center gap-1">
                            <ArchiveX className="w-3 h-3" /> ARCHIVED
                        </span>
                    )}
                    {lead.priority === 'HOT' && lead.is_active !== false && (
                        <span className="px-4 py-1.5 bg-rose-500 text-white text-[11px] font-semibold rounded-full animate-pulse shadow-sm">HOT 🔥</span>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <h3 className="text-xl font-semibold text-slate-900 font-mono tracking-tight leading-none mb-1">{lead.win_probability}%<span className="text-xs text-slate-400 ml-1">WIN</span></h3>
                    <p className="text-[11px] font-semibold text-slate-400">Added Date: {new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {lead.is_active === false && lead.archive_reason && (
                <div className="mb-6 p-4 bg-slate-50 border-l-4 border-slate-900 rounded-r-2xl">
                    <p className="text-xs font-semibold text-slate-400 mb-1">Archive Reason</p>
                    <p className="text-sm font-medium text-slate-700">"{lead.archive_reason}"</p>
                </div>
            )}

            <h2 className={clsx("text-3xl font-semibold mb-2 font-semibold leading-tight transition-colors", lead.is_active === false ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-[#7c3aed]")}>
                {lead.first_name} {lead.last_name}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mb-6">Target Country: {lead.target_country || 'GLOBAL'}</p>

            {/* Tactical Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl group-hover:bg-white transition-all transform duration-200">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2 opacity-60">Email Address</span>
                    <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#7c3aed]" />
                        <span className="text-[11px] font-semibold text-slate-900 truncate">{lead.email}</span>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl group-hover:bg-white transition-all transform duration-200 delay-75">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2 opacity-60">Assigned To</span>
                    <div className="flex items-center gap-2 truncate">
                        <Users2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[11px] font-semibold text-slate-900 truncate">{assignedName}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Deployment */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                    <a href={`tel:${lead.phone}`} className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-sm">
                        <Activity className="w-6 h-6" />
                    </a>
                    <button onClick={onWhatsAppTrigger} className="w-10 h-10 rounded-lg bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/20 flex items-center justify-center hover:bg-[#128C7E] hover:text-white transition-all shadow-sm">
                        <MessageSquare className="w-6 h-6 fill-current" />
                    </button>
                </div>
                <button onClick={() => setIsTimelineOpen(true)} className="flex-1 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center gap-3 text-xs font-semibold hover:border-[#7c3aed]/30 hover:text-[#7c3aed] transition-all group/btn">
                    <Clock className="w-4 h-4 transition-transform duration-200" />
                    View History
                </button>
            </div>

            {canAssignLeads && (
                <div className="mb-6">
                    <label className="text-[11px] font-semibold text-slate-400 mb-3 block ml-2">Assign Counselor</label>
                    <div className="relative">
                        <select
                            value={lead.assigned_to || ''}
                            onChange={(e) => onAssign(lead.id, e.target.value || null)}
                            disabled={isAssigning}
                            className="w-full appearance-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] transition-all cursor-pointer ring-1 ring-inset ring-white"
                        >
                            <option value="">Unassigned</option>
                            {counselors.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                            ))}
                        </select>
                        <ArrowUpRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <button onClick={() => setIsTimelineOpen(true)} className="flex-1 py-5 bg-slate-50 text-slate-400 text-xs font-semibold rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">View Details</button>
                {lead.status !== 'CONVERTED' && (
                    <button
                        onClick={(e) => onConvert(lead.id, e)}
                        disabled={isConverting}
                        className="flex-[2] py-5 bg-gradient-to-br from-[#7c3aed] to-indigo-600 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3"
                    >
                        {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                        Convert to Student
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isTimelineOpen && (
                    <LeadInteractionTimeline lead={lead} isOpen={isTimelineOpen} onClose={() => setIsTimelineOpen(false)} onInteractionAdded={onInteractionAdded} />
                )}
            </AnimatePresence>
        </div>
    );
};

const AddLeadModal = ({ isOpen, onClose, onSuccess }: any) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<LeadCreateData>({
        first_name: '', last_name: '', email: '', phone: '', target_country: '', source: 'WALK_IN', status: 'NEW', notes: ''
    });
    const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!formData.email && !formData.phone) { setDuplicateInfo(null); return; }
            try { setDuplicateInfo(await checkDuplicateLead({ email: formData.email, phone: formData.phone })); } catch (error) { console.error('Duplicate check failed:', error); }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.email, formData.phone]);

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: (newLead) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onSuccess();
            navigate(`/admin/leads/${newLead.id}`);
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Add New Lead</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-all p-4 bg-white border border-slate-200 rounded-xl">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto premium-scrollbar">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 ml-2">First Name</label>
                            <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] outline-none transition-all placeholder:opacity-30" placeholder="First Name" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 ml-2">Last Name</label>
                            <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] outline-none transition-all placeholder:opacity-30" placeholder="Last Name" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 ml-2">Email Address</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] outline-none transition-all placeholder:opacity-30" placeholder="email@address.com" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-400 ml-2">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed] outline-none transition-all placeholder:opacity-30" placeholder="+XX XXX..." />
                        </div>
                    </div>

                    {duplicateInfo?.exists && (
                        <div className="p-6 bg-amber-50 border-2 border-amber-100 rounded-2xl flex gap-6 animate-in slide-in-from-top-4">
                            <AlertCircle className="w-10 h-10 text-amber-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-xl font-semibold text-amber-900">Duplicate Lead Detected</h4>
                                <p className="text-sm text-amber-700 font-bold mt-2">
                                    <span className="text-[#7c3aed]">{duplicateInfo.lead?.full_name}</span> is already documented as <span className="font-semibold bg-white px-2 py-0.5 rounded-lg border border-amber-200">{duplicateInfo.lead?.status}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-xs font-semibold text-slate-400 ml-2">Target Country</label>
                        <select value={formData.target_country} onChange={(e) => setFormData({ ...formData, target_country: e.target.value })} className="w-full appearance-none px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 outline-none transition-all">
                            <option value="">Select Country</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-semibold text-slate-400 ml-2">Lead Source</label>
                            <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })} className="w-full appearance-none px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 transition-all">
                                <option value="WALK_IN">Walk-in</option>
                                <option value="WEBSITE">Website</option>
                                <option value="REFERRAL">Referral</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-semibold text-slate-400 ml-2">Lead Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })} className="w-full appearance-none px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:ring-4 focus:ring-[#7c3aed]/10 transition-all">
                                {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const).map(s => (
                                    <option key={s} value={s}>{leadStatusLabels[s]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-900 border-t border-white/10 flex justify-between items-center">
                    <button onClick={onClose} className="text-white/40 font-semibold text-xs hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => createMutation.mutate(formData)}
                        disabled={createMutation.isPending}
                        className="px-6 py-5 bg-white text-slate-900 rounded-2xl font-semibold text-xs hover:bg-[#7c3aed] hover:text-white transition-all shadow-sm disabled:opacity-30"
                    >
                        {createMutation.isPending ? 'Adding Lead...' : 'Add Lead'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Leads;
