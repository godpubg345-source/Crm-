import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVisaMilestones,
    createVisaMilestone,
    updateVisaMilestone,
    updateVisaCase,
    type VisaCase,
    type VisaMilestone,
    type VisaCaseUpdateData
} from '../../services/visa';
import {
    X,
    CheckCircle2,
    Clock,
    Plus,
    Calendar,
    MapPin,
    ShieldCheck,
    CreditCard,
    FileText,
    Fingerprint,
    Stethoscope,
    Globe,
    AlertCircle,
    Lock
} from 'lucide-react';
import { format } from 'date-fns';
import SmartChecklist from '../applications/SmartChecklist';
import clsx from 'clsx';

// ============================================================================
// VISA DETAIL MODAL - GLOBAL MOBILITY DOSSIER
// ============================================================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    visaCase: VisaCase;
}

export const VisaDetailModal = ({ isOpen, onClose, visaCase }: ModalProps) => {
    const queryClient = useQueryClient();
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [formData, setFormData] = useState<Partial<VisaCaseUpdateData>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'CHECKLIST' | 'TIMELINE'>('DETAILS');

    const { data: milestonesData, isLoading: milestonesLoading } = useQuery({
        queryKey: ['visa-milestones', visaCase.id],
        queryFn: () => getVisaMilestones(visaCase.id),
        enabled: isOpen
    });

    const milestones = milestonesData?.results || [];

    const updateCaseMutation = useMutation({
        mutationFn: (data: VisaCaseUpdateData) => updateVisaCase(visaCase.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visa-cases'] });
            queryClient.invalidateQueries({ queryKey: ['visa-case', visaCase.id] });
            setIsEditing(false);
        }
    });

    const createMilestoneMutation = useMutation({
        mutationFn: createVisaMilestone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visa-milestones'] });
            setNewMilestoneTitle('');
        }
    });

    const updateMilestoneMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<VisaMilestone> }) => updateVisaMilestone(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visa-milestones'] })
    });


    const handleSave = () => {
        updateCaseMutation.mutate(formData);
    };

    const toggleMilestone = (milestone: VisaMilestone) => {
        const newStatus = milestone.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        const completedAt = newStatus === 'COMPLETED' ? new Date().toISOString() : null;
        updateMilestoneMutation.mutate({
            id: milestone.id,
            data: { status: newStatus, completed_at: completedAt }
        });
    };

    if (!isOpen) return null;

    const studentName = visaCase.student_details?.full_name || 'Unknown student';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with High-Fidelity Blur */}
            <div className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200" onClick={onClose} />

            <div className="bg-white rounded-xl w-full max-w-6xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-200 h-[90vh] flex flex-col overflow-hidden border border-slate-200">

                {/* Modal Header */}
                <div className="px-6 pt-10 pb-6 flex justify-between items-start border-b border-slate-50 bg-slate-50/10">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-indigo-900 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                            {(studentName).charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                    {studentName}
                                </h2>
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                                    {visaCase.student_details?.student_code || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-[11px] font-semibold text-slate-400">
                                    Visa case
                                </p>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className={clsx(
                                    "text-[11px] font-semibold px-2 py-0.5 rounded-lg border",
                                    visaCase.status === 'DECISION_RECEIVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                )}>
                                    {visaCase.status_display || visaCase.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => {
                                    setFormData({
                                        vfs_date: visaCase.vfs_date,
                                        vfs_location: visaCase.vfs_location,
                                        ihs_reference: visaCase.ihs_reference,
                                        ihs_amount: visaCase.ihs_amount,
                                        notes: visaCase.notes,
                                        decision_status: visaCase.decision_status,
                                        biometric_done: visaCase.biometric_done,
                                        tb_test_done: visaCase.tb_test_done,
                                        visa_fee_amount: visaCase.visa_fee_amount,
                                        cas_number: visaCase.cas_number,
                                        priority: visaCase.priority
                                    });
                                    setIsEditing(true);
                                }}
                                className="h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                            >
                                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="h-12 px-6 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={updateCaseMutation.isPending}
                                    className="h-12 px-6 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
                                >
                                    {updateCaseMutation.isPending ? 'Saving...' : (
                                        <>
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-6 bg-slate-50/50 border-b border-slate-100 flex gap-8">
                    {[
                        { id: 'DETAILS', label: 'Details', icon: FileText },
                        { id: 'CHECKLIST', label: 'Compliance Checklist', icon: ShieldCheck },
                        { id: 'TIMELINE', label: 'Timeline', icon: Clock }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex items-center gap-2 py-4 text-xs font-semibold transition-all border-b-2 relative",
                                activeTab === tab.id ? "text-[#7c3aed] border-[#7c3aed]" : "text-slate-400 border-transparent hover:text-slate-600"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto premium-scrollbar bg-white">
                    {activeTab === 'DETAILS' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left Content: Main Form */}
                                <div className="lg:col-span-8 space-y-6">

                                    {/* Section 1: Strategic Origins (Identity & Core) */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-3">
                                            <Globe className="w-4 h-4 text-indigo-500" />
                                            Basics
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30 p-6 rounded-2xl border border-slate-100/50 hover:border-indigo-100 transition-colors">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">CAS number</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        placeholder="CAS number"
                                                        value={isEditing ? formData.cas_number || '' : visaCase.cas_number || ''}
                                                        onChange={e => setFormData({ ...formData, cas_number: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">Priority</label>
                                                <div className="relative group">
                                                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                                    <select
                                                        disabled={!isEditing}
                                                        value={isEditing ? formData.priority || 'NORMAL' : visaCase.priority || 'NORMAL'}
                                                        onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                                        className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all appearance-none cursor-pointer disabled:cursor-default"
                                                    >
                                                        <option value="NORMAL">Normal</option>
                                                        <option value="URGENT">Urgent</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Tactical Logistics (Appointment & Biometrics) */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-[#7c3aed]" />
                                            Appointment
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-[#7c3aed]/10 relative overflow-hidden">

                                            <div className="space-y-2 relative z-10">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">VFS date</label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                                                    <input
                                                        type="datetime-local"
                                                        disabled={!isEditing}
                                                        value={isEditing ? (formData.vfs_date || '').substring(0, 16) : (visaCase.vfs_date || '').substring(0, 16)}
                                                        onChange={e => setFormData({ ...formData, vfs_date: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 relative z-10">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">VFS centre</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        placeholder="VFS centre"
                                                        value={isEditing ? formData.vfs_location || '' : visaCase.vfs_location || ''}
                                                        onChange={e => setFormData({ ...formData, vfs_location: e.target.value })}
                                                        className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-span-full grid grid-cols-2 gap-4 pt-2 relative z-10">
                                                <label className="flex items-center gap-4 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:border-[#7c3aed]/20 transition-all group">
                                                    <Fingerprint className={clsx(
                                                        "w-4 h-4 transition-colors",
                                                        (isEditing ? formData.biometric_done : visaCase.biometric_done) ? "text-emerald-500" : "text-slate-300"
                                                    )} />
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-semibold text-slate-600 tracking-tight leading-none">Biometrics</p>
                                                        <p className="text-[11px] text-slate-500 mt-1 tracking-tight">Done</p>
                                                    </div>
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        (isEditing ? formData.biometric_done : visaCase.biometric_done) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200"
                                                    )}>
                                                        {(isEditing ? formData.biometric_done : visaCase.biometric_done) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            disabled={!isEditing}
                                                            checked={isEditing ? formData.biometric_done : visaCase.biometric_done}
                                                            onChange={e => setFormData({ ...formData, biometric_done: e.target.checked })}
                                                        />
                                                    </div>
                                                </label>

                                                <label className="flex items-center gap-4 px-6 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:border-[#7c3aed]/20 transition-all group">
                                                    <Stethoscope className={clsx(
                                                        "w-4 h-4 transition-colors",
                                                        (isEditing ? formData.tb_test_done : visaCase.tb_test_done) ? "text-emerald-500" : "text-slate-300"
                                                    )} />
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-semibold text-slate-600 tracking-tight leading-none">TB Screening</p>
                                                        <p className="text-[11px] text-slate-500 mt-1 tracking-tight">Medical</p>
                                                    </div>
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                        (isEditing ? formData.tb_test_done : visaCase.tb_test_done) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200"
                                                    )}>
                                                        {(isEditing ? formData.tb_test_done : visaCase.tb_test_done) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            disabled={!isEditing}
                                                            checked={isEditing ? formData.tb_test_done : visaCase.tb_test_done}
                                                            onChange={e => setFormData({ ...formData, tb_test_done: e.target.checked })}
                                                        />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Financial Integrity (IHS & Fees) */}
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-3">
                                            <CreditCard className="w-4 h-4 text-blue-500" />
                                            Fees
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/30 p-6 rounded-2xl border border-slate-100/50">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">IHS Reference</label>
                                                <div className="relative group">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        placeholder="IHS-XXXXX"
                                                        value={isEditing ? formData.ihs_reference || '' : visaCase.ihs_reference || ''}
                                                        onChange={e => setFormData({ ...formData, ihs_reference: e.target.value.toUpperCase() })}
                                                        className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">IHS amount (£)</label>
                                                <div className="relative group">
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        disabled={!isEditing}
                                                        value={isEditing ? formData.ihs_amount || '' : visaCase.ihs_amount || ''}
                                                        onChange={e => setFormData({ ...formData, ihs_amount: parseFloat(e.target.value) })}
                                                        className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-slate-400 ml-1">Visa Surcharge (£)</label>
                                                <div className="relative group">
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <input
                                                        type="number"
                                                        disabled={!isEditing}
                                                        value={isEditing ? formData.visa_fee_amount || '' : visaCase.visa_fee_amount || ''}
                                                        onChange={e => setFormData({ ...formData, visa_fee_amount: parseFloat(e.target.value) })}
                                                        className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Intelligence Artifacts */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden shadow-sm">

                                        <h4 className="text-xs font-semibold mb-6 flex items-center gap-3 text-indigo-300">
                                            <Clock className="w-4 h-4" />
                                            Record
                                        </h4>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                <div>
                                                    <p className="text-[11px] text-white/40 font-semibold mb-1">Created</p>
                                                    <p className="font-bold text-lg">{format(new Date(visaCase.created_at), 'dd MMM yyyy')}</p>
                                                </div>
                                                <p className="text-[11px] text-white/30 font-bold tracking-tight mb-1.5">{format(new Date(visaCase.created_at), 'HH:mm')}</p>
                                            </div>

                                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                                <div>
                                                    <p className="text-[11px] text-white/40 font-semibold mb-1">Last updated</p>
                                                    <p className="font-bold text-lg">{format(new Date(visaCase.updated_at), 'dd MMM yyyy')}</p>
                                                </div>
                                                <p className="text-[11px] text-white/30 font-bold tracking-tight mb-1.5">{format(new Date(visaCase.updated_at), 'HH:mm')}</p>
                                            </div>

                                            <div className="pt-4">
                                                <label className="text-[11px] font-semibold text-white/40 mb-3 block">Notes</label>
                                                <textarea
                                                    disabled={!isEditing}
                                                    value={isEditing ? formData.notes || '' : visaCase.notes || ''}
                                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                    rows={4}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-bold text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/20 transition-all resize-none premium-scrollbar"
                                                    placeholder="Add notes..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decision Status Panel */}
                                    <div className={clsx(
                                        "p-6 rounded-2xl border transition-all duration-500",
                                        visaCase.decision_status === 'APPROVED' ? "bg-emerald-50 border-emerald-100" :
                                            visaCase.decision_status === 'REJECTED' ? "bg-rose-50 border-rose-100" : "bg-amber-50/50 border-amber-100"
                                    )}>
                                        <h4 className={clsx(
                                            "text-xs font-semibold mb-4 flex items-center gap-3",
                                            visaCase.decision_status === 'APPROVED' ? "text-emerald-600" :
                                                visaCase.decision_status === 'REJECTED' ? "text-rose-600" : "text-amber-600"
                                        )}>
                                            <ShieldCheck className="w-4 h-4" />
                                            Decision notes
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'PENDING', label: 'In Progress' },
                                                    { id: 'APPROVED', label: 'Granted' },
                                                    { id: 'REJECTED', label: 'Refused' },
                                                    { id: 'WITHDRAWN', label: 'Withdrawn' }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        disabled={!isEditing}
                                                        onClick={() => setFormData({ ...formData, decision_status: opt.id })}
                                                        className={clsx(
                                                            "py-2.5 rounded-xl text-[11px] font-semibold transition-all",
                                                            (isEditing ? formData.decision_status : visaCase.decision_status) === opt.id
                                                                ? "bg-white shadow-sm ring-2 ring-[#7c3aed]/30 text-slate-900 border-transparent transition-all scale-[1.02] z-10"
                                                                : "bg-transparent text-slate-400 border border-slate-200/50 hover:border-slate-300"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CHECKLIST' && (
                        <div className="p-6 animate-in fade-in slide-in-from-right-10 duration-200">
                            <SmartChecklist
                                studentId={visaCase.student}
                                destinationCountry={visaCase.destination_country || 'United Kingdom'}
                                studentNationality={visaCase.student_nationality || 'India'}
                            />
                        </div>
                    )}

                    {activeTab === 'TIMELINE' && (
                        <div className="p-6 animate-in fade-in slide-in-from-right-10 duration-200 max-w-2xl mx-auto">
                            <div className="space-y-4">
                                {milestonesLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : (
                                    <>
                                        {milestones.length === 0 && (
                                            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                                                <Clock className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1} />
                                                <p className="text-[12px] font-semibold text-slate-400">No timeline yet</p>
                                            </div>
                                        )}
                                        <div className="space-y-4 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100" />

                                            {milestones.map((milestone, idx) => (
                                                <div key={milestone.id} className="flex gap-6 items-start group relative z-10">
                                                    <button
                                                        onClick={() => toggleMilestone(milestone)}
                                                        className={clsx(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-sm",
                                                            milestone.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-400 text-white scale-110" : "bg-white border-slate-100 text-slate-300 group-hover:border-[#7c3aed]/30"
                                                        )}
                                                    >
                                                        {milestone.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                                    </button>
                                                    <div className="flex-1 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:border-[#7c3aed]/10 transition-all duration-200">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h5 className={clsx(
                                                                "text-sm font-semibold tracking-tight",
                                                                milestone.status === 'COMPLETED' ? "text-slate-400" : "text-slate-900"
                                                            )}>{milestone.title}</h5>
                                                            {milestone.status === 'COMPLETED' && (
                                                                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Verified</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-500">Event</p>
                                                        {milestone.notes && (
                                                            <p className="mt-3 text-xs text-slate-500 leading-relaxed border-l-2 border-[#7c3aed]/10 pl-3">
                                                                {milestone.notes}
                                                            </p>
                                                        )}
                                                        <div className="mt-4 flex justify-between items-center text-[11px] font-semibold text-slate-300">
                                                            <span>Checkpoint #{idx + 1}</span>
                                                            {milestone.completed_at && <span>{format(new Date(milestone.completed_at), 'MMM dd, yyyy HH:mm')}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quick Add Form in Timeline */}
                                        <form
                                            onSubmit={e => {
                                                e.preventDefault();
                                                if (newMilestoneTitle.trim()) {
                                                    createMilestoneMutation.mutate({ visa_case: visaCase.id, title: newMilestoneTitle });
                                                }
                                            }}
                                            className="mt-6 flex gap-4 p-4 bg-white rounded-xl border border-slate-200 relative z-20"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Add an update..."
                                                value={newMilestoneTitle}
                                                onChange={e => setNewMilestoneTitle(e.target.value)}
                                                className="flex-1 px-6 py-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-300 bg-slate-50/50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMilestoneTitle.trim() || createMilestoneMutation.isPending}
                                                className="h-12 w-12 bg-violet-600 text-white rounded-2xl hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center justify-center"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
