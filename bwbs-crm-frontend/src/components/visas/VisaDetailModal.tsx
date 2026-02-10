import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVisaMilestones,
    createVisaMilestone,
    updateVisaMilestone,
    deleteVisaMilestone,
    updateVisaCase,
    type VisaCase,
    type VisaMilestone,
    type VisaCaseUpdateData
} from '../../services/visa';
import {
    X,
    CheckCircle2,
    Circle,
    Clock,
    Plus,
    Trash2,
    Calendar,
    MapPin,
    ShieldCheck,
    CreditCard,
    FileText
} from 'lucide-react';
import { format } from 'date-fns';

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

    const deleteMilestoneMutation = useMutation({
        mutationFn: deleteVisaMilestone,
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

    const studentName = visaCase.student_details?.full_name || 'Unknown Scholar';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with High-Fidelity Blur */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 max-h-[90vh] flex flex-col overflow-hidden border border-white">

                {/* Modal Header */}
                <div className="px-10 pt-10 pb-8 flex justify-between items-start border-b border-slate-50 bg-slate-50/10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#AD03DE] to-indigo-900 rounded-3xl flex items-center justify-center text-white font-serif font-bold text-3xl shadow-xl">
                            {(studentName).charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
                                    {studentName}
                                </h2>
                                <span className="bg-[#AD03DE] text-white px-3 py-1 rounded-xl text-[10px] font-mono font-bold shadow-lg shadow-[#AD03DE]/20">
                                    {visaCase.student_details?.student_code || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                    Global Mobility Dossier
                                </p>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${visaCase.status === 'DECISION_RECEIVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                    {visaCase.status_display || visaCase.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
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
                                        visa_fee_amount: visaCase.visa_fee_amount
                                    });
                                    setIsEditing(true);
                                }}
                                className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4 text-emerald-400" />
                                Modify Dossier
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={updateCaseMutation.isPending}
                                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center gap-2"
                                >
                                    {updateCaseMutation.isPending ? 'Synchronizing...' : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Commit Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto premium-scrollbar p-10 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Column 1 & 2: Form Sections */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Section: Appointment Logistics */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#AD03DE] shadow-[0_0_8px_rgba(173,3,222,0.5)]" />
                                    Institutional Appointment Protocols
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 ring-1 ring-slate-50 p-8 rounded-[2rem] bg-slate-50/30">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">VFS Interaction Date</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                            <input
                                                type="datetime-local"
                                                disabled={!isEditing}
                                                value={isEditing ? (formData.vfs_date || '').substring(0, 16) : (visaCase.vfs_date || '').substring(0, 16)}
                                                onChange={e => setFormData({ ...formData, vfs_date: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-serif font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">VFS Diplomatic Center</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                placeholder="Enter VFS Location..."
                                                value={isEditing ? formData.vfs_location || '' : visaCase.vfs_location || ''}
                                                onChange={e => setFormData({ ...formData, vfs_location: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-serif font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-full flex gap-6 mt-2">
                                        <label className="flex-1 flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-[#AD03DE]/20 transition-all group">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(isEditing ? formData.biometric_done : visaCase.biometric_done) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-200'
                                                }`}>
                                                {(isEditing ? formData.biometric_done : visaCase.biometric_done) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    disabled={!isEditing}
                                                    checked={isEditing ? formData.biometric_done : visaCase.biometric_done}
                                                    onChange={e => setFormData({ ...formData, biometric_done: e.target.checked })}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Biometrics Authenticated</span>
                                        </label>
                                        <label className="flex-1 flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-[#AD03DE]/20 transition-all group">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${(isEditing ? formData.tb_test_done : visaCase.tb_test_done) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-200'
                                                }`}>
                                                {(isEditing ? formData.tb_test_done : visaCase.tb_test_done) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    disabled={!isEditing}
                                                    checked={isEditing ? formData.tb_test_done : visaCase.tb_test_done}
                                                    onChange={e => setFormData({ ...formData, tb_test_done: e.target.checked })}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">TB Screening Verified</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Financial Intelligence */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="w-2 h-0.5 bg-blue-500" />
                                    Mobility Liquidity & Compliance
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IHS Reference Trace</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                            <input
                                                type="text"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.ihs_reference || '' : visaCase.ihs_reference || ''}
                                                onChange={e => setFormData({ ...formData, ihs_reference: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all disabled:opacity-50 uppercase"
                                                placeholder="IHS-XXXXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IHS Levy (£)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="number"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.ihs_amount || '' : visaCase.ihs_amount || ''}
                                                onChange={e => setFormData({ ...formData, ihs_amount: parseFloat(e.target.value) })}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Visa Surcharge (£)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="number"
                                                disabled={!isEditing}
                                                value={isEditing ? formData.visa_fee_amount || '' : visaCase.visa_fee_amount || ''}
                                                onChange={e => setFormData({ ...formData, visa_fee_amount: parseFloat(e.target.value) })}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Strategic Notes */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    Consultant Observations
                                </label>
                                <textarea
                                    disabled={!isEditing}
                                    value={isEditing ? formData.notes || '' : visaCase.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    rows={5}
                                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-serif font-bold text-slate-600 focus:ring-8 focus:ring-[#AD03DE]/5 outline-none disabled:opacity-60 resize-none shadow-inner transition-all"
                                    placeholder="Strategic insights, risk assessments, and institutional observations..."
                                />
                            </div>
                        </div>

                        {/* Column 3: Timeline & Intelligence Artifacts */}
                        <div className="space-y-10">
                            {/* Milestone Tracker Card */}
                            <div className="bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#AD03DE]/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-[#AD03DE]" />
                                    Strategic Milestones
                                </h3>

                                <div className="space-y-1 flex-1">
                                    {milestonesLoading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white rounded-2xl animate-pulse" />)}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {milestones.length === 0 && (
                                                <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                                                    <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1} />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No check-points verified</p>
                                                </div>
                                            )}
                                            {milestones.map(milestone => (
                                                <div key={milestone.id} className="flex items-center gap-4 p-3 bg-white/60 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all group/milestone">
                                                    <button
                                                        onClick={() => toggleMilestone(milestone)}
                                                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${milestone.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-50 border border-emerald-100 shadow-sm' : 'text-slate-200 border border-slate-100 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {milestone.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" strokeWidth={3} />}
                                                    </button>
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-xs font-bold leading-none ${milestone.status === 'COMPLETED' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                                            {milestone.title}
                                                        </span>
                                                        {milestone.completed_at && (
                                                            <p className="text-[8px] text-emerald-500 uppercase font-bold mt-1 tracking-tighter">Verified {format(new Date(milestone.completed_at), 'MMM dd')}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                                                        className="p-2 opacity-0 group-hover/milestone:opacity-100 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <form
                                        onSubmit={e => {
                                            e.preventDefault();
                                            if (newMilestoneTitle.trim()) {
                                                createMilestoneMutation.mutate({ visa_case: visaCase.id, title: newMilestoneTitle });
                                            }
                                        }}
                                        className="mt-10 flex gap-3 p-2 bg-white rounded-[1.5rem] shadow-sm border border-slate-100"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Flag interaction..."
                                            value={newMilestoneTitle}
                                            onChange={e => setNewMilestoneTitle(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMilestoneTitle.trim() || createMilestoneMutation.isPending}
                                            className="w-10 h-10 bg-[#AD03DE] text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-[#AD03DE]/20 active:scale-90"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Risk Mitigation Indicator */}
                            <div className="p-8 bg-emerald-50/30 rounded-[3rem] border border-emerald-100">
                                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Dossier Integrity High
                                </h4>
                                <p className="text-[10px] text-emerald-500 leading-relaxed font-serif font-bold">
                                    Electronic verification protocols suggest a high probability of institutional acceptance based on current milestone coverage.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
