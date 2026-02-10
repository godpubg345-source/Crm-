import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getApplications,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    type Application,
    type ApplicationStatus,
    statusLabels,
    statusColors,
    statusTransitions
} from '../../services/applications';
import { getUniversities, getCoursesByUniversity } from '../../services/universities';

// ============================================================================
// APPLICATIONS TAB COMPONENT - BWBS Education CRM
// ============================================================================

interface ApplicationsTabProps {
    studentId: string;
}

const ApplicationsTab = ({ studentId }: ApplicationsTabProps) => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        university_id: '',
        course_id: '',
        intake: '',
        intake_date: '',
        notes: '',
    });

    // Fetch applications
    const { data, isLoading, isError } = useQuery({
        queryKey: ['applications', studentId],
        queryFn: () => getApplications({ student: studentId }),
    });

    // Fetch universities for dropdown
    const { data: universitiesData, isLoading: isLoadingUniversities } = useQuery({
        queryKey: ['universities'],
        queryFn: () => getUniversities(),
    });

    // Fetch courses for selected university
    const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['courses', formData.university_id],
        queryFn: () => getCoursesByUniversity(formData.university_id),
        enabled: !!formData.university_id,
    });

    // Create application mutation
    const createMutation = useMutation({
        mutationFn: createApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications', studentId] });
            setIsFormOpen(false);
            setFormData({ university_id: '', course_id: '', intake: '', intake_date: '', notes: '' });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
            updateApplicationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications', studentId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteApplication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications', studentId] });
        },
    });

    const handleUniversityChange = (universityId: string) => {
        setFormData({ ...formData, university_id: universityId, course_id: '' });
    };

    const handleSubmit = () => {
        if (formData.university_id && formData.course_id && formData.intake) {
            createMutation.mutate({
                student: studentId,
                university_id: formData.university_id,
                course_id: formData.course_id,
                intake: formData.intake,
                intake_date: formData.intake_date || `${formData.intake}-01`,
                notes: formData.notes || undefined,
            });
        }
    };

    const universities = universitiesData?.results || [];
    const courses = coursesData?.results || [];
    const applications = data?.results || [];

    // Loading State
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-10 w-48 bg-slate-50 rounded-xl" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-[2rem] border border-border" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-12 text-center bg-rose-50/30 border border-rose-100 rounded-[2.5rem]">
                <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px]">Registry Access Denied</p>
                <p className="text-rose-400 text-sm mt-1">Unable to harmonize application archives.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header with High-End Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-slate-900">Academic Application Vault</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{applications.length} strategic dossier{applications.length !== 1 ? 's' : ''} in repository</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#AD03DE] hover:bg-[#9302bb] text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-[#AD03DE]/20 active:scale-95 group"
                >
                    <svg className={`w-5 h-5 transition-transform duration-500 ${isFormOpen ? 'rotate-45' : 'group-hover:rotate-12'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    {isFormOpen ? 'Cancel Entry' : 'New Prospectus Entry'}
                </button>
            </div>

            {/* Premium Inline Form */}
            {isFormOpen && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] space-y-8 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#AD03DE]/5 to-transparent blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* University Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Institution</label>
                            <select
                                value={formData.university_id}
                                onChange={(e) => handleUniversityChange(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">{isLoadingUniversities ? 'Retrieving Institutions...' : 'Select Institution...'}</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>{uni.name} ({uni.country})</option>
                                ))}
                            </select>
                        </div>

                        {/* Course Select */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Path</label>
                            <select
                                value={formData.course_id}
                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                disabled={!formData.university_id || isLoadingCourses}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all appearance-none cursor-pointer disabled:opacity-30"
                            >
                                <option value="">
                                    {!formData.university_id ? 'Institution Identification Required...' : isLoadingCourses ? 'Calibrating Courses...' : 'Select Path...'}
                                </option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.name} ({course.level})</option>
                                ))}
                            </select>
                        </div>

                        {/* Intake Month */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Intake Cycle</label>
                            <input
                                type="month"
                                value={formData.intake}
                                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contextual Remarks</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Strategic details..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-serif font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.university_id || !formData.course_id || !formData.intake || createMutation.isPending}
                            className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95 flex items-center gap-3"
                        >
                            {createMutation.isPending ? 'Synchronizing...' : (
                                <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Authorize Application
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-8 border border-slate-100 text-[#AD03DE] shadow-xl group hover:scale-110 transition-all duration-700">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Vault is Unpopulated</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                        Academic dossiers have not yet been established. Initialize a prospectus entry to track the scholar's higher education journey.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {applications.map((app) => (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            onStatusChange={(status) => statusMutation.mutate({ id: app.id, status })}
                            onDelete={() => deleteMutation.mutate(app.id)}
                            isUpdating={statusMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Application Card Component
interface ApplicationCardProps {
    application: Application;
    onStatusChange: (status: ApplicationStatus) => void;
    onDelete: () => void;
    isUpdating: boolean;
}

const ApplicationCard = ({ application, onStatusChange, onDelete, isUpdating }: ApplicationCardProps) => {
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const availableTransitions = statusTransitions[application.status] || [];

    return (
        <div className="group bg-white rounded-[2.5rem] p-6 border border-border shadow-sm hover:shadow-2xl hover:border-[#AD03DE]/10 hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#AD03DE]/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                    {/* Brand Identifier */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-600 to-indigo-900 flex items-center justify-center text-white flex-shrink-0 shadow-xl group-hover:rotate-6 transition-transform duration-700">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-serif font-bold text-slate-900 truncate mb-1">
                            {application.university_name_display || application.university?.name || "Institution"}
                        </h4>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            {application.course_name_display || application.course?.name || "Program"}
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{application.course?.level || "Level"}</span>
                        </p>

                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Intake: {application.intake_date || application.intake}
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {application.course?.duration || "Duration"}
                            </span>
                            {application.application_ref && (
                                <span className="font-mono text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 shadow-inner">
                                    REF: {application.application_ref}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status & Interactions */}
                <div className="flex items-center gap-4 self-end lg:self-center">
                    {/* Enhanced Status Artifact */}
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            disabled={availableTransitions.length === 0 || isUpdating}
                            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm ${statusColors[application.status]} ${availableTransitions.length > 0 ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5' : 'cursor-default'
                                }`}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            {statusLabels[application.status]}
                            {availableTransitions.length > 0 && (
                                <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${showStatusMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>

                        {/* Dropdown Artifact */}
                        {showStatusMenu && availableTransitions.length > 0 && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowStatusMenu(false)} />
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[110] py-3 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
                                    <div className="px-5 py-2 mb-1">
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Advance Protocol</p>
                                    </div>
                                    {availableTransitions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                onStatusChange(status);
                                                setShowStatusMenu(false);
                                            }}
                                            className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status].split(' ')[1]}`} />
                                            {statusLabels[status]}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Delete Artifact */}
                    <button
                        onClick={onDelete}
                        className="p-3.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-500"
                        title="Decommission Record"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* CAS Artifact Strip (if applicable) */}
            {application.cas_number && (
                <div className="mt-6 pt-5 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2 text-emerald-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            CAS Verification Confirmed:
                        </span>
                        <span className="font-mono text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 shadow-inner">{application.cas_number}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationsTab;


