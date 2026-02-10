import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVisaCases,
    createVisaCase,
    updateVisaCase,
    type VisaCase,
    type VisaCaseUpdateData
} from '../../services/visa';
import SmartChecklist from '../applications/SmartChecklist';

// ============================================================================
// VISA TAB COMPONENT - BWBS Education CRM
// ============================================================================

interface VisaTabProps {
    studentId: string;
    nationality?: string;
}

const VisaTab = ({ studentId, nationality }: VisaTabProps) => {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['visa-cases', studentId],
        queryFn: () => getVisaCases(studentId),
    });

    const createMutation = useMutation({
        mutationFn: createVisaCase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visa-cases', studentId] });
        },
    });

    // Loading State
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-48 bg-slate-50 rounded-3xl border border-border" />
                <div className="h-96 bg-slate-50 rounded-3xl border border-border" />
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">Failed to load visa case</p>
            </div>
        );
    }

    const visaCase = data?.results?.[0] as VisaCase | undefined;

    // No Visa Case - Show Start Button
    if (!visaCase) {
        return (
            <div className="space-y-8">
                <SmartChecklist studentId={studentId} destinationCountry="UK" studentNationality={nationality || 'Unknown'} />

                <div className="text-center py-20 bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center mb-8 border border-slate-100 text-[#AD03DE] shadow-xl group hover:rotate-6 transition-all duration-700">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Immigration Roadmap Required</h3>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                        The scholar's UK visa journey has not been initialized. Establish a strategic tracker to monitor CAS induction and biometric milestones.
                    </p>
                    <button
                        onClick={() => createMutation.mutate({ student: studentId })}
                        disabled={createMutation.isPending}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-[#AD03DE] hover:bg-[#9302bb] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#AD03DE]/30 disabled:opacity-50 active:scale-95 group"
                    >
                        {createMutation.isPending ? 'Initializing...' : (
                            <>
                                <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Start Visa Induction
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Active Case - Show Tracker Form
    return (
        <div className="space-y-6">
            <SmartChecklist studentId={studentId} destinationCountry="UK" studentNationality={nationality || 'Unknown'} />
            <VisaTrackerForm visaCase={visaCase} studentId={studentId} />
        </div>
    );
};

// ============================================================================
// VISA TRACKER FORM
// ============================================================================

interface VisaTrackerFormProps {
    visaCase: VisaCase;
    studentId: string;
}

const VisaTrackerForm = ({ visaCase, studentId }: VisaTrackerFormProps) => {
    const queryClient = useQueryClient();
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState<VisaCaseUpdateData>({
        status: visaCase.status,
        cas_number: visaCase.cas_number || '',
        vfs_date: visaCase.vfs_date || '',
        vfs_location: visaCase.vfs_location || '',
        biometric_done: visaCase.biometric_done,
        tb_test_done: visaCase.tb_test_done,
        tb_test_date: visaCase.tb_test_date || '',
        ihs_reference: visaCase.ihs_reference || '',
        ihs_amount: visaCase.ihs_amount,
        visa_fee_amount: visaCase.visa_fee_amount,
        submission_date: visaCase.submission_date || '',
        decision_date: visaCase.decision_date || '',
        visa_start_date: visaCase.visa_start_date || '',
        visa_end_date: visaCase.visa_end_date || '',
        decision_status: visaCase.decision_status,
        notes: visaCase.notes || '',
    });

    // Track changes
    useEffect(() => {
        const changed = JSON.stringify(formData) !== JSON.stringify({
            status: visaCase.status,
            cas_number: visaCase.cas_number || '',
            vfs_date: visaCase.vfs_date || '',
            vfs_location: visaCase.vfs_location || '',
            biometric_done: visaCase.biometric_done,
            tb_test_done: visaCase.tb_test_done,
            tb_test_date: visaCase.tb_test_date || '',
            ihs_reference: visaCase.ihs_reference || '',
            ihs_amount: visaCase.ihs_amount,
            visa_fee_amount: visaCase.visa_fee_amount,
            submission_date: visaCase.submission_date || '',
            decision_date: visaCase.decision_date || '',
            visa_start_date: visaCase.visa_start_date || '',
            visa_end_date: visaCase.visa_end_date || '',
            decision_status: visaCase.decision_status,
            notes: visaCase.notes || '',
        });
        setHasChanges(changed);
    }, [formData, visaCase]);

    const updateMutation = useMutation({
        mutationFn: (data: VisaCaseUpdateData) => updateVisaCase(visaCase.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visa-cases', studentId] });
            setHasChanges(false);
        },
    });

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const handleInputChange = (field: keyof VisaCaseUpdateData, value: string | number | boolean | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Status */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#AD03DE] via-brand-600 to-brand-800 flex items-center justify-center text-white shadow-xl shadow-[#AD03DE]/20">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19l-1.5 3-.5-3.5L3 15l15-9 3 3-9 15-2.5-5z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-serif font-bold text-slate-900">Visa Milestone Tracker</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Case Opened {new Date(visaCase.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Current Verdict</span>
                    <span className={`px-4 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-widest shadow-sm ${visaCase.decision_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        visaCase.decision_status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {visaCase.decision_status || 'PENDING'}
                    </span>
                </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CAS Number */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-[#AD03DE]/30 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">UK CAS Identifier</label>
                    <input
                        type="text"
                        value={formData.cas_number || ''}
                        onChange={(e) => handleInputChange('cas_number', e.target.value)}
                        placeholder="E.g., E4G4BK2E123456"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-mono font-bold text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner"
                    />
                </div>

                {/* VFS Appointment Date */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-[#AD03DE]/30 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">VFS Appointment Schedule</label>
                    <input
                        type="datetime-local"
                        value={formData.vfs_date || ''}
                        onChange={(e) => handleInputChange('vfs_date', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner"
                    />
                </div>

                {/* IHS Reference */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-[#AD03DE]/30 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">IHS Reference Number</label>
                    <input
                        type="text"
                        value={formData.ihs_reference || ''}
                        onChange={(e) => handleInputChange('ihs_reference', e.target.value)}
                        placeholder="E.g., IHS123456789"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-mono font-bold text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner"
                    />
                </div>

                {/* VFS Location */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-[#AD03DE]/30 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Processing Center Location</label>
                    <input
                        type="text"
                        value={formData.vfs_location || ''}
                        onChange={(e) => handleInputChange('vfs_location', e.target.value)}
                        placeholder="Enter City / Center Code"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner"
                    />
                </div>

                {/* Visa Decision Status */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:border-[#AD03DE]/30 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Official Decision State</label>
                    <select
                        value={formData.decision_status}
                        onChange={(e) => handleInputChange('decision_status', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner"
                    >
                        <option value="PENDING">Pending Decision</option>
                        <option value="APPROVED">Visa Granted</option>
                        <option value="REJECTED">Visa Refused</option>
                    </select>
                </div>
            </div>

            {/* Checkboxes */}
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Process Verification Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    <CheckboxItem
                        label="Biometrics Inducted"
                        checked={formData.biometric_done || false}
                        onChange={(checked) => handleInputChange('biometric_done', checked)}
                    />
                    <CheckboxItem
                        label="TB Certification"
                        checked={formData.tb_test_done || false}
                        onChange={(checked) => handleInputChange('tb_test_done', checked)}
                    />
                    <CheckboxItem
                        label="Under Appeal"
                        checked={formData.appeal_submitted || false}
                        onChange={(checked) => handleInputChange('appeal_submitted', checked)}
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Strategic Case Remarks</label>
                <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Document subtle case details or officer remarks..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-inner resize-none font-serif font-bold"
                />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-2">
                    {hasChanges ? 'Induction Updates Detected' : 'Dossier in Equilibrium'}
                </p>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                    className="inline-flex items-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95"
                >
                    {updateMutation.isPending ? 'Syncing...' : (
                        <>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            Commit Case Updates
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Checkbox Item Component
interface CheckboxItemProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const CheckboxItem = ({ label, checked, onChange }: CheckboxItemProps) => (
    <label className="flex items-center gap-4 cursor-pointer group">
        <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500 ${checked
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner'
                : 'bg-white border-slate-100 group-hover:border-[#AD03DE]/30 group-hover:bg-[#AD03DE]/5 text-slate-200'
                }`}
            onClick={() => onChange(!checked)}
        >
            <svg className={`w-5 h-5 transition-all duration-500 ${checked ? 'scale-110 opacity-100' : 'scale-50 opacity-0 group-hover:opacity-30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <div className="flex-1 min-w-0">
            <span className={`text-[10px] uppercase tracking-widest block transition-colors duration-500 font-bold ${checked ? 'text-emerald-600' : 'text-slate-400 group-hover:text-[#AD03DE]'}`}>
                {label}
            </span>
            <span className={`text-[9px] font-medium block transition-colors duration-500 ${checked ? 'text-emerald-600/60' : 'text-slate-300'}`}>
                {checked ? 'Verified & Committed' : 'Induction Pending'}
            </span>
        </div>
    </label>
);

export default VisaTab;
