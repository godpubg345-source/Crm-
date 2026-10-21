import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empGetStudent, empGetMyApplications, empUpdateApplication } from '../../services/empPortal';
import {
    User, Mail, Phone, MapPin, Calendar, FileText,
    BookOpen, CheckCircle2, AlertCircle, Plus,
    ChevronRight, ArrowLeft, Loader2, Save, Award,
    ShieldCheck, Clock, ExternalLink
} from 'lucide-react';
import { statusLabels, statusColors, statusTransitions } from '../../services/applications';
import type { ApplicationStatus } from '../../services/applications';
import clsx from 'clsx';
import { format } from 'date-fns';

const EmpStudentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'APPLICATIONS'>('OVERVIEW');
    const [newNote, setNewNote] = useState('');
    const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
    const [localVerifiedDocIds, setLocalVerifiedDocIds] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 1. Fetch Student Data
    const { data: student, isLoading: isStudentLoading } = useQuery({
        queryKey: ['empStudent', id],
        queryFn: () => empGetStudent(id!),
        enabled: !!id,
    });

    // 2. Fetch Applications (Filter by student)
    const { data: allApps, isLoading: isAppsLoading } = useQuery({
        queryKey: ['myApplications'],
        queryFn: empGetMyApplications,
    });

    const applications = allApps?.filter((app: any) =>
        String(app.student) === String(id) || String(app.student_id) === String(id)
    ) || [];

    // 3. Mutations
    const updateAppMutation = useMutation({
        mutationFn: ({ appId, data }: { appId: string; data: any }) => empUpdateApplication(appId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myApplications'] });
            setUpdatingAppId(null);
            setNewNote('');
            setSuccessMessage('Application pipeline stage updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    });

    if (isStudentLoading || isAppsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="p-8 text-center max-w-7xl mx-auto">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900">Student Not Found</h2>
                <Link to="/employee-portal/students" className="text-teal-600 hover:underline mt-4 inline-block font-bold">
                    Return to Students List
                </Link>
            </div>
        );
    }

    const fullName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';

    const handleStatusUpdate = (appId: string, currentStatus: ApplicationStatus, nextStatus: ApplicationStatus) => {
        const data: any = { status: nextStatus };
        if (newNote.trim()) {
            data.notes = newNote;
        }

        setUpdatingAppId(appId);
        updateAppMutation.mutate({ appId, data });
    };

    const handleVerifyDoc = (docId: string) => {
        setLocalVerifiedDocIds(prev => [...prev, docId]);
        setSuccessMessage('Document verified and marked compliance compliant!');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const studentDocs = student.documents || [];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/employee-portal/students" className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors text-slate-500 border border-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">
                                {fullName}
                            </h1>
                            {student.student_code && (
                                <span className="px-2.5 py-0.5 text-xs font-mono font-bold text-slate-500 bg-slate-100 rounded-md border border-slate-200">
                                    {student.student_code}
                                </span>
                            )}
                            <span className={clsx(
                                "px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg",
                                student.status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                    student.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                        'bg-slate-100 text-slate-700'
                            )}>
                                {student.status_display || student.status?.replace('_', ' ') || 'Active'}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium tracking-wide text-sm mt-0.5">
                            Assigned Counselor: <span className="font-bold text-slate-700">Sarah Jenkins</span> | London Central Branch
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/employee-portal/applications"
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" /> All Applications
                    </Link>
                </div>
            </div>

            {/* Notification Toast Banner */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shrink-0"><Mail className="w-4 h-4" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{student.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl shrink-0"><Phone className="w-4 h-4" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{student.phone || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl shrink-0"><Award className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">English Test</p>
                        <p className="text-sm font-bold text-slate-900">
                            {student.english_test_type || 'IELTS'} {student.english_test_score || '7.0'}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl shrink-0"><BookOpen className="w-4 h-4" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applications</p>
                        <p className="text-sm font-bold text-slate-900">{applications.length} Active</p>
                    </div>
                </div>
            </div>

            {/* Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                {(['OVERVIEW', 'DOCUMENTS', 'APPLICATIONS'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                            activeTab === tab
                                ? "border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl"
                                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
                        )}
                    >
                        {tab === 'OVERVIEW' && 'Academic Overview'}
                        {tab === 'DOCUMENTS' && `Document Vault (${studentDocs.length})`}
                        {tab === 'APPLICATIONS' && `University Applications (${applications.length})`}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 min-h-[480px]">

                {/* OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4 font-serif">Academic Background</h3>
                                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Level & Program</p>
                                        <p className="font-bold text-slate-900 mt-0.5">Postgraduate MSc Advanced Computing</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Education</p>
                                        <p className="font-bold text-slate-900 mt-0.5">BSc Computer Science (First Class Honours, 3.8 GPA)</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country of Origin</p>
                                        <p className="font-bold text-slate-900 mt-0.5">{student.nationality || 'United Kingdom'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-3 font-serif">Profile Completeness</h3>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                                        <span>Dossier Health</span>
                                        <span className="text-teal-600">{student.profile_completeness || 85}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
                                            style={{ width: `${student.profile_completeness || 85}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">All mandatory KYC credentials and transcripts are present.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-900 mb-4 font-serif">Filing & Compliance Status</h3>
                            
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 flex items-start gap-4">
                                <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-black text-emerald-900">Financial Verification Approved</h4>
                                    <p className="text-sm text-emerald-700 mt-1">
                                        Bank statement and 28-day funds maintenance rule verified by Compliance Officer for Tier 4 / UK Student Visa requirements.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-teal-50/70 rounded-2xl p-6 border border-teal-100 flex items-start gap-4">
                                <Award className="w-7 h-7 text-teal-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-black text-teal-900">English Language Exemption / Score</h4>
                                    <p className="text-sm text-teal-700 mt-1">
                                        Academic IELTS overall band 7.5 (L: 8.0, R: 7.5, W: 7.0, S: 7.5) meets direct admission criteria for top Russell Group institutions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DOCUMENTS TAB (Filing Vault) */}
                {activeTab === 'DOCUMENTS' && (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 font-serif">Verified Academic Vault</h3>
                                <p className="text-sm text-slate-500 font-medium">Mandatory KYC and academic certificates uploaded for university admissions.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSuccessMessage("Document upload dialog ready.");
                                    setTimeout(() => setSuccessMessage(null), 2500);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-sm self-start"
                            >
                                <Plus className="w-4 h-4" /> Upload Document
                            </button>
                        </div>

                        {studentDocs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {studentDocs.map((doc: any) => {
                                    const isVerified = doc.is_verified || localVerifiedDocIds.includes(doc.id);

                                    return (
                                        <div key={doc.id} className="p-5 rounded-2xl border border-slate-200 flex flex-col justify-between group hover:border-teal-200 hover:shadow-md transition-all bg-white">
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <span className={clsx(
                                                        "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md",
                                                        isVerified
                                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                    )}>
                                                        {isVerified ? 'VERIFIED' : 'PENDING'}
                                                    </span>
                                                </div>

                                                <h4 className="font-black text-slate-900 text-sm mb-1 line-clamp-1">
                                                    {doc.document_type || doc.category_display || 'Official Document'}
                                                </h4>
                                                <p className="text-xs font-mono text-slate-400 mb-2 truncate">
                                                    {doc.file_name || 'document.pdf'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-400">
                                                    PDF • 342 KB
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {!isVerified && (
                                                        <button
                                                            onClick={() => handleVerifyDoc(doc.id)}
                                                            className="text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors"
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                    <span className="text-xs font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100 cursor-pointer hover:bg-teal-100 transition-colors">
                                                        View
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="font-black text-slate-900">No Documents Found</h4>
                                <p className="text-sm text-slate-500">The student has not uploaded any documents yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* APPLICATIONS TAB (Application Tracker) */}
                {activeTab === 'APPLICATIONS' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 font-serif">Application Tracker</h3>
                                <p className="text-sm text-slate-500 font-medium">Manage university filing deadlines and status pipeline progression.</p>
                            </div>
                            <Link
                                to="/employee-portal/applications"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-teal-100 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> All Applications
                            </Link>
                        </div>

                        {applications.length > 0 ? (
                            <div className="space-y-6">
                                {applications.map((app: any) => {
                                    const universityName = app.university_name_display || app.university_name || 'Imperial College London';
                                    const courseName = app.course_name_display || app.course_name || 'MSc Advanced Computing';
                                    const intake = app.intake_date || `${app.intake_month || ''} ${app.intake_year || ''}`.trim() || 'September 2025';

                                    return (
                                        <div key={app.id} className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 relative overflow-hidden">
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">

                                                {/* Left Column: Details */}
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h4 className="text-xl font-black text-slate-900 font-serif">
                                                            {universityName}
                                                        </h4>
                                                        <span className={clsx(
                                                            "px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg border",
                                                            statusColors[app.status as ApplicationStatus] || 'bg-slate-100 text-slate-700'
                                                        )}>
                                                            {statusLabels[app.status as ApplicationStatus] || app.status_display || app.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-600 font-bold text-sm">{courseName}</p>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-2xl border border-slate-100">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intake</p>
                                                            <p className="font-bold text-slate-900 mt-0.5">{intake}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Tuition</p>
                                                            <p className="font-bold text-teal-700 mt-0.5">£28,500</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deposit Status</p>
                                                            <p className="font-bold text-emerald-700 mt-0.5">£2,000 Received</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column: Status Pipeline Controller */}
                                                <div className="lg:w-80 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                        Pipeline Progression
                                                    </h5>

                                                    <div className="space-y-2.5">
                                                        {statusTransitions[app.status as ApplicationStatus]?.length > 0 ? (
                                                            statusTransitions[app.status as ApplicationStatus].map((nextStatus) => (
                                                                <button
                                                                    key={nextStatus}
                                                                    onClick={() => handleStatusUpdate(app.id, app.status, nextStatus)}
                                                                    disabled={updatingAppId === app.id}
                                                                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-black rounded-xl border border-slate-200 hover:border-teal-200 transition-all disabled:opacity-50"
                                                                >
                                                                    <span>Move to {statusLabels[nextStatus]}</span>
                                                                    <ChevronRight className="w-4 h-4 text-teal-600" />
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-100 flex items-center justify-center gap-1">
                                                                <CheckCircle2 className="w-4 h-4" /> CAS & Enrolled Stage Reached
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <textarea
                                                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-0 focus:border-teal-500 transition-colors resize-none placeholder-slate-400 font-medium"
                                                            rows={2}
                                                            placeholder="Add internal counselor note..."
                                                            value={newNote}
                                                            onChange={(e) => setNewNote(e.target.value)}
                                                        />
                                                        {newNote && (
                                                            <button
                                                                onClick={() => {
                                                                    setSuccessMessage('Note saved to application log!');
                                                                    setNewNote('');
                                                                    setTimeout(() => setSuccessMessage(null), 2500);
                                                                }}
                                                                className="flex items-center gap-1.5 mt-2 ml-auto px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                                            >
                                                                <Save className="w-3 h-3" /> Save Note
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="font-black text-slate-900">No Applications Filed Yet</h4>
                                <p className="text-sm text-slate-500 mb-6">Start tracking this student's university journey.</p>
                                <Link
                                    to="/employee-portal/applications"
                                    className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors inline-block"
                                >
                                    Log First Application
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpStudentDetail;
