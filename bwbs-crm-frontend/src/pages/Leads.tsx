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
} from '../services/leads';
import { getCounselors, type UserListItem } from '../services/users';
import { getCurrentUser } from '../services/auth';
import LeadInteractionTimeline from '../components/leads/LeadInteractionTimeline';
import WhatsAppAutomationDrawer from '../components/leads/WhatsAppAutomationDrawer';
import WhatsAppMagicDispatcher from '../components/leads/WhatsAppMagicDispatcher';
import { type WhatsAppTemplate } from '../services/leads';

// ============================================================================
// LEADS PAGE - BWBS Education CRM
// ============================================================================

const Leads = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<LeadStatus | 'ALL'>('ALL');
    const [selectedLeadForWA, setSelectedLeadForWA] = useState<Lead | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const user = getCurrentUser();
    const canAssignLeads = user?.role === 'SUPER_ADMIN' || user?.role === 'COUNTRY_MANAGER' || user?.role === 'BRANCH_MANAGER';

    const { data, isLoading, isError } = useQuery({
        queryKey: ['leads', activeFilter],
        queryFn: () => getLeads(activeFilter === 'ALL' ? undefined : activeFilter),
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
            navigate(`/students/${response.student_id}`);
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

    // Filter leads by status groups for Kanban-like feel
    const leads = data?.results || [];

    const selectAll = () => {
        if (selectedIds.length === leads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(leads.map(l => l.id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {toast.message}
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-serif">Sales Pipeline</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage potential students and conversions</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#AD03DE] hover:bg-[#9302bb] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#AD03DE]/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Lead
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 pb-2 premium-scrollbar overflow-x-auto">
                {(['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveFilter(status)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all active:scale-95 ${activeFilter === status
                            ? 'bg-[#AD03DE] text-white shadow-lg shadow-[#AD03DE]/20'
                            : 'bg-white text-slate-600 border border-border hover:text-[#AD03DE] hover:border-[#AD03DE]/50 shadow-sm'
                            }`}
                    >
                        {status === 'ALL' ? 'All Leads' : leadStatusLabels[status]}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center py-12">
                    <p className="text-red-400">Failed to load leads</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-border shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 border border-slate-100">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif">No Leads Found</h3>
                    <p className="text-slate-500 text-sm">
                        {activeFilter !== 'ALL' ? `No leads with status '${leadStatusLabels[activeFilter as LeadStatus]}'` : 'Start by adding a new lead to the pipeline'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(leads) && leads.map((lead) => (
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

            {/* Add Lead Modal */}
            <AddLeadModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['leads'] });
                    setIsAddModalOpen(false);
                }}
            />
            {/* WhatsApp Automation Drawer */}
            {selectedLeadForWA && (
                <WhatsAppAutomationDrawer
                    isOpen={!!selectedLeadForWA}
                    onClose={() => setSelectedLeadForWA(null)}
                    lead={selectedLeadForWA}
                />
            )}

            {/* WhatsApp Magic Dispatcher */}
            {selectedDispatcherTemplate && (
                <WhatsAppMagicDispatcher
                    isOpen={!!selectedDispatcherTemplate}
                    onClose={() => setSelectedDispatcherTemplate(null)}
                    selectedLeads={leads.filter(l => selectedIds.includes(l.id))}
                    template={selectedDispatcherTemplate}
                />
            )}

            {/* Bulk Action Bar - Floating */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-6 ring-1 ring-white/10 backdrop-blur-xl border-t border-white/10">
                        <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
                            <span className="w-8 h-8 rounded-full bg-[#AD03DE] flex items-center justify-center text-sm font-bold shadow-lg shadow-[#AD03DE]/40">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={selectAll}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-sm font-bold"
                            >
                                {selectedIds.length === leads.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                                onClick={() => setBulkActionType('ASSIGN')}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-sm font-bold"
                            >
                                <svg className="w-5 h-5 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Assign
                            </button>
                            <button
                                onClick={() => setBulkActionType('STATUS_UPDATE')}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors text-sm font-bold"
                            >
                                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Status
                            </button>
                            <button
                                onClick={() => setBulkActionType('WHATSAPP_TEMPLATE')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors text-sm font-bold border border-emerald-500/20"
                            >
                                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 448 512">
                                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.6-44.8-27.7-16.6-14.8-27.8-33-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                                </svg>
                                WhatsApp Blast
                            </button>
                        </div>

                        <button
                            onClick={() => setSelectedIds([])}
                            className="ml-6 p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                            title="Deselect all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Action Parameters Modal */}
            {bulkActionType && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900 font-serif">
                                {bulkActionType === 'ASSIGN' && 'Bulk Assign Counselors'}
                                {bulkActionType === 'STATUS_UPDATE' && 'Bulk Status Update'}
                                {bulkActionType === 'WHATSAPP_TEMPLATE' && 'Bulk WhatsApp Blast'}
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Applying to {selectedIds.length} selected leads</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {bulkActionType === 'ASSIGN' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Counselor</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-bold"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                bulkMutation.mutate({
                                                    lead_ids: selectedIds,
                                                    action: 'ASSIGN',
                                                    assigned_to: e.target.value
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">Choose Counselor...</option>
                                        {Array.isArray(counselors) && counselors.map(c => (
                                            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {bulkActionType === 'STATUS_UPDATE' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New Status</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as LeadStatus[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => bulkMutation.mutate({
                                                    lead_ids: selectedIds,
                                                    action: 'STATUS_UPDATE',
                                                    status: s
                                                })}
                                                className={`px-4 py-2 text-sm font-bold rounded-lg border text-left transition-all ${leadStatusColors[s]}`}
                                            >
                                                {leadStatusLabels[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bulkActionType === 'WHATSAPP_TEMPLATE' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Template</label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto premium-scrollbar pr-2">
                                        {Array.isArray(bulkTemplates) && bulkTemplates.length > 0 && bulkTemplates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setSelectedDispatcherTemplate(t);
                                                    setBulkActionType(null);
                                                    // Note: Interaction logging is handled by the dispatcher component
                                                }}
                                                className="w-full p-4 border border-border hover:border-[#AD03DE]/50 hover:bg-[#AD03DE]/5 rounded-xl text-left transition-all group"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#AD03DE]">{t.title}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">{t.category_display}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-border flex justify-end">
                            <button
                                onClick={() => setBulkActionType(null)}
                                className="px-6 py-2 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

// Lead Card Component
const LeadCard = ({
    lead,
    counselors,
    canAssignLeads,
    onAssign,
    isAssigning,
    onConvert,
    isConverting,
    onInteractionAdded,
    onWhatsAppTrigger,
    isSelected,
    onSelect,
}: {
    lead: Lead;
    counselors: UserListItem[];
    canAssignLeads: boolean;
    onAssign: (id: string, counselorId: string | null) => void;
    isAssigning: boolean;
    onConvert: (id: string, e: React.MouseEvent) => void;
    isConverting: boolean;
    onInteractionAdded: () => void;
    onWhatsAppTrigger: () => void;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const assignedName = lead.assigned_to_details
        ? `${lead.assigned_to_details.first_name} ${lead.assigned_to_details.last_name}`
        : 'Unassigned';

    const slaViolated = lead.is_sla_violated;

    return (
        <div className={`bg-white rounded-3xl border-2 p-6 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all group relative overflow-hidden ${slaViolated ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100 hover:border-[#AD03DE]/30'}`}>
            {/* Background Glow for Priority */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10 transition-all group-hover:opacity-20 ${lead.priority === 'HOT' ? 'bg-rose-500' : 'bg-[#AD03DE]'}`} />
            {/* Selection Checkbox */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                    className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected
                        ? 'bg-[#AD03DE] border-[#AD03DE] text-white'
                        : 'bg-white border-slate-200 group-hover:border-[#AD03DE]/50'
                        }`}
                >
                    {isSelected && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* SLA Warning Ribbon */}
            {slaViolated && (
                <div className="absolute top-0 right-0 px-4 py-1 bg-rose-500 text-white text-[8px] font-bold uppercase tracking-[0.2em] transform rotate-0 z-20 shadow-lg">
                    {lead.priority === 'HOT' ? 'Ghost Alert' : 'SLA Breached'}
                </div>
            )}

            <div className="flex justify-between items-start mb-5 pl-8">
                <div className="flex gap-2">
                    <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full border shadow-sm ${leadStatusColors[lead.status]}`}>
                        {leadStatusLabels[lead.status]}
                    </span>
                    {lead.priority === 'HOT' && (
                        <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full animate-pulse shadow-lg shadow-rose-200">
                            HOT 🔥
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-2 h-2 rounded-full ${lead.win_probability >= 70 ? 'bg-emerald-500 animate-pulse' : lead.win_probability >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="text-[14px] font-serif font-black text-slate-900 leading-none">
                            {lead.win_probability}% <span className="text-[9px] uppercase tracking-tighter text-slate-400">Win</span>
                        </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-[#AD03DE] transition-colors font-serif leading-tight">
                {lead.first_name} {lead.last_name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Target: {lead.target_country || 'Global'}
            </p>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 mb-6">
                <a
                    href={`tel:${lead.phone}`}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-90"
                    title="Call"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 012 5z" />
                    </svg>
                </a>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onWhatsAppTrigger();
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-90"
                    title="WhatsApp"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.6-44.8-27.7-16.6-14.8-27.8-33-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.8 2.8-3.2 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                    </svg>
                </button>
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95 group/btn"
                >
                    <svg className="w-4 h-4 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Timeline
                </button>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#AD03DE] border border-slate-100 group-hover:bg-[#AD03DE]/10 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Electronic Mail</span>
                        <span className="truncate font-bold text-slate-700">{lead.email}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100 group-hover:bg-indigo-50 transition-colors shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Custodian</span>
                        <span className="font-bold text-slate-700">{assignedName}</span>
                    </div>
                </div>
            </div>

            {
                canAssignLeads && (
                    <div className="mb-6">
                        <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-[0.3em] mb-2 ml-1">Assign Custodian</label>
                        <select
                            value={lead.assigned_to || ''}
                            onChange={(e) => onAssign(lead.id, e.target.value || null)}
                            disabled={isAssigning}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE] transition-all disabled:opacity-60"
                        >
                            <option value="">Unassigned</option>
                            {Array.isArray(counselors) && counselors.map((counselor) => (
                                <option key={counselor.id} value={counselor.id}>
                                    {counselor.first_name} {counselor.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            }

            <div className="flex gap-2">
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                    View Timeline
                </button>
                {lead.status !== 'CONVERTED' && (
                    <button
                        onClick={(e) => onConvert(lead.id, e)}
                        disabled={isConverting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-[#AD03DE] to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#AD03DE]/20 disabled:opacity-70"
                    >
                        {isConverting ? 'Processing...' : 'Promote to Student'}
                    </button>
                )}
            </div>

            {/* Interaction Timeline Modal Integration */}
            {
                isTimelineOpen && (
                    <LeadInteractionTimeline
                        lead={lead}
                        isOpen={isTimelineOpen}
                        onClose={() => setIsTimelineOpen(false)}
                        onInteractionAdded={onInteractionAdded}
                    />
                )
            }
        </div >
    );
};

// Add Lead Modal Component
interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddLeadModal = ({ isOpen, onClose, onSuccess }: AddLeadModalProps) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<LeadCreateData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        target_country: '',
        source: 'WALK_IN',
        status: 'NEW',
        notes: ''
    });

    const [duplicateInfo, setDuplicateInfo] = useState<{
        exists: boolean;
        lead?: { id: string; full_name: string; status: string; staff: string };
    } | null>(null);

    // Debounced check
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!formData.email && !formData.phone) {
                setDuplicateInfo(null);
                return;
            }
            try {
                const result = await checkDuplicateLead({
                    email: formData.email,
                    phone: formData.phone
                });
                setDuplicateInfo(result);
            } catch (error) {
                console.error('Duplicate check failed:', error);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.email, formData.phone]);

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: (newLead) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onSuccess();
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                target_country: '',
                source: 'WALK_IN',
                status: 'NEW',
                notes: ''
            });
            navigate(`/leads/${newLead.id}`);
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">Add New Lead</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-medium"
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-medium"
                                placeholder="Smith"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-medium"
                                placeholder="jane@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-medium"
                                placeholder="+44 7..."
                            />
                        </div>
                    </div>

                    {duplicateInfo?.exists && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-amber-900">Potential Duplicate Detected</h4>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    <strong>{duplicateInfo.lead?.full_name}</strong> is already in the system as <strong>{duplicateInfo.lead?.status}</strong>, managed by <strong>{duplicateInfo.lead?.staff}</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Country</label>
                        <select
                            value={formData.target_country}
                            onChange={(e) => setFormData({ ...formData, target_country: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-bold"
                        >
                            <option value="">Select Destination</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="USA">USA</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Source</label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-bold"
                            >
                                <option value="WALK_IN">Walk-in</option>
                                <option value="WEBSITE">Website</option>
                                <option value="FACEBOOK">Facebook</option>
                                <option value="REFERRAL">Referral</option>
                                <option value="EVENT">Event</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-bold"
                            >
                                {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const).map(s => (
                                    <option key={s} value={s}>{leadStatusLabels[s]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-border rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm min-h-[100px] font-medium"
                            placeholder="Initial requirements..."
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate(formData)}
                        disabled={createMutation.isPending || (duplicateInfo?.exists ?? false)}
                        className="px-8 py-2.5 bg-[#AD03DE] hover:bg-[#9302bb] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#AD03DE]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createMutation.isPending ? 'Saving...' : 'Add Lead'}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Leads;
