import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    getApplications,
    getApplicationById,
    getApplicationChecklist,
    updateChecklistItem,
    getApplicationNotes,
    createApplicationNote,
    updateApplicationStatus,
    getApplicationTimeline,
    statusLabels,
    statusColors,
    statusTransitions,
    type Application,
    type ApplicationStatus
} from '../services/applications';
import ApplicationPipelineBoard from './ApplicationPipeline';
import { getTasks, createTask, type Task } from '../services/tasks';
import {
    Calendar,
    Loader2,
    ShieldCheck,
    Navigation,
    BookOpen,
    X,
    Layout,
    Columns,
    FileText,
    RotateCcw,
    Search,
    Zap,
    ListChecks,
    MessageSquare,
    Clock,
    CheckCircle2,
    ClipboardList
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// ADMISSIONS COMMAND CENTER - HIGH-FIDELITY ADMISSIONS HUB
// ============================================================================

const statusShadowMap: Record<string, string> = {
    DRAFT: 'shadow-slate-500/5',
    DOCUMENTS_READY: 'shadow-amber-500/5',
    SUBMITTED: 'shadow-indigo-500/5',
    UNDER_REVIEW: 'shadow-blue-500/5',
    INTERVIEW_SCHEDULED: 'shadow-indigo-500/5',
    CONDITIONAL_OFFER: 'shadow-amber-500/5',
    UNCONDITIONAL_OFFER: 'shadow-emerald-500/5',
    OFFER_ACCEPTED: 'shadow-emerald-500/5',
    OFFER_DECLINED: 'shadow-rose-500/5',
    CAS_REQUESTED: 'shadow-cyan-500/5',
    CAS_RECEIVED: 'shadow-emerald-500/5',
    ENROLLED: 'shadow-slate-900/10',
    REJECTED: 'shadow-rose-500/5',
    WITHDRAWN: 'shadow-slate-200/10',
};

const Applications = () => {
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedIntake, setSelectedIntake] = useState<string>('');
    const [viewMode, setViewMode] = useState<'ledger' | 'pipeline'>('ledger');
    const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'timeline' | 'notes' | 'tasks'>('overview');
    const [noteText, setNoteText] = useState('');
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');

    const queryClient = useQueryClient();

    // Data Fetching
    const { data: appsResponse, isLoading, isError } = useQuery({
        queryKey: ['applications', selectedStatus, selectedIntake],
        queryFn: () => getApplications({
            status: selectedStatus || undefined,
            intake: selectedIntake || undefined
        })
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: ApplicationStatus }) => updateApplicationStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applicationDetail'] });
        }
    });

    const checklistMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateChecklistItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicationChecklist'] });
            queryClient.invalidateQueries({ queryKey: ['applicationDetail'] });
        }
    });

    const noteMutation = useMutation({
        mutationFn: createApplicationNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicationNotes'] });
            queryClient.invalidateQueries({ queryKey: ['applicationDetail'] });
        }
    });

    const taskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicationTasks'] });
        }
    });

    const applications = (appsResponse?.results || []) as Application[];

    const filteredApps = applications.filter(app =>
        (app.student_name || app.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.university_name_display || app.university?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.course_name_display || app.course?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedApplication = applications.find(app => app.id === selectedAppId);

    const { data: applicationDetail, isLoading: isDetailLoading } = useQuery({
        queryKey: ['applicationDetail', selectedAppId],
        queryFn: () => getApplicationById(selectedAppId as string),
        enabled: !!selectedAppId,
    });

    const { data: checklistItems = [] } = useQuery({
        queryKey: ['applicationChecklist', selectedAppId],
        queryFn: () => getApplicationChecklist(selectedAppId as string),
        enabled: !!selectedAppId,
    });

    const { data: applicationNotes = [] } = useQuery({
        queryKey: ['applicationNotes', selectedAppId],
        queryFn: () => getApplicationNotes(selectedAppId as string),
        enabled: !!selectedAppId,
    });

    const { data: timeline = [] } = useQuery({
        queryKey: ['applicationTimeline', selectedAppId],
        queryFn: () => getApplicationTimeline(selectedAppId as string),
        enabled: !!selectedAppId,
    });

    const { data: tasksResponse } = useQuery({
        queryKey: ['applicationTasks', selectedAppId],
        queryFn: () => getTasks({ application: selectedAppId as string }),
        enabled: !!selectedAppId,
    });

    const applicationTasks = tasksResponse?.results || [];

    const activeApplication = applicationDetail || selectedApplication;
    const availableTransitions = useMemo(() => {
        if (!activeApplication?.status) return [];
        return statusTransitions[activeApplication.status] || [];
    }, [activeApplication]);

    const statusOptions = useMemo(() => {
        if (!activeApplication?.status) return [];
        const set = new Set<string>([activeApplication.status, ...availableTransitions]);
        return Array.from(set);
    }, [activeApplication, availableTransitions]);

    const activeStudentId = useMemo(() => {
        if (!activeApplication) return undefined;
        return activeApplication.student_id || activeApplication.student?.id;
    }, [activeApplication]);

    useEffect(() => {
        if (selectedAppId) {
            setActiveTab('overview');
        }
    }, [selectedAppId]);

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Synchronizing Admissions Intel</p>
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-rose-500 bg-rose-50/20 p-12 gap-6">
            <ShieldCheck className="w-16 h-16 text-rose-300" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Deployment Error: Connection Lost</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-rose-500/20">Retry Command</button>
        </div>
    );

    return (
        <div className="flex bg-slate-50/30 min-h-[calc(100vh-80px)] overflow-hidden relative font-sans">
            {/* Main Content Area */}
            <div className={clsx(
                "flex-1 p-6 lg:p-10 transition-all duration-700 ease-in-out pe-6 pb-20",
                selectedAppId ? "lg:mr-[30rem]" : ""
            )}>
                {/* Tactical Command Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-2 h-10 bg-[#AD03DE] rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                            <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight">Admissions Command</h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6">Global Application Repository • Institutional Oversight</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                            <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE]" />
                            <input
                                type="text"
                                placeholder="Search Admissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-800 placeholder:text-slate-300 w-48 uppercase tracking-widest"
                            />
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl">
                            <Layout className="w-4 h-4 text-slate-300" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 focus:ring-0 cursor-pointer uppercase tracking-widest"
                            >
                                <option value="">Filter Status</option>
                                {(Object.entries(statusLabels) as Array<[ApplicationStatus, string]>).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl">
                            <Calendar className="w-4 h-4 text-slate-300" />
                            <select
                                value={selectedIntake}
                                onChange={(e) => setSelectedIntake(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 focus:ring-0 cursor-pointer uppercase tracking-widest"
                            >
                                <option value="">Global Intake</option>
                                <option value="SEPT_24">Sept 2024</option>
                                <option value="JAN_25">Jan 2025</option>
                                <option value="MAY_25">May 2025</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setViewMode('ledger')}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                    viewMode === 'ledger' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Layout className="w-4 h-4" />
                                Ledger
                            </button>
                            <button
                                onClick={() => setViewMode('pipeline')}
                                className={clsx(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                    viewMode === 'pipeline' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Columns className="w-4 h-4" />
                                Pipeline
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'ledger' ? (
                    /* Premium Admissions Ledger */
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-10 py-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Scholar Identity</th>
                                        <th className="px-10 py-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Academy & Program</th>
                                        <th className="px-10 py-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Intake Window</th>
                                        <th className="px-10 py-7 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Admissions Status</th>
                                        <th className="px-10 py-7 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Strategic Assets</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredApps.map((app) => {
                                        const statusKey = app.status as ApplicationStatus;

                                        return (
                                            <tr
                                                key={app.id}
                                                onClick={() => setSelectedAppId(app.id)}
                                                className={clsx(
                                                    "group hover:bg-slate-50 transition-all cursor-pointer relative",
                                                    selectedAppId === app.id ? "bg-slate-50/80" : ""
                                                )}
                                            >
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm group-hover:bg-[#AD03DE] group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                                            {(app.student_name || app.student?.name || 'S').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-serif font-bold text-slate-900 group-hover:text-[#AD03DE] transition-colors">{app.student_name || app.student?.name || 'Scholar'}</div>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded border border-slate-100">NODE-{app.id.slice(0, 8).toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                            <BookOpen className="w-4 h-4" />
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-800">{app.university_name_display || app.university?.name || 'University'}</div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-11">{app.course_name_display || app.course?.name || 'Program'}</div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-rose-400">
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 font-mono tracking-tighter">{app.intake_date || app.intake}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all duration-500",
                                                        `${statusColors[statusKey] || "bg-slate-50 text-slate-400 border-slate-100"} ${statusShadowMap[statusKey] || ""}`
                                                    )}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                                        {statusLabels[statusKey] || app.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`/students/${app.student_id || app.student?.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-[#AD03DE] hover:border-[#AD03DE]/30 transition-all active:scale-95 shadow-sm"
                                                            title="Scholarly Insight"
                                                        >
                                                            <Navigation className="w-5 h-5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                                {selectedAppId === app.id && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#AD03DE] shadow-[4px_0_15px_rgba(173,3,222,0.3)]" />
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filteredApps.length === 0 && (
                            <div className="p-32 flex flex-col items-center justify-center text-slate-300 gap-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center">
                                    <Layout className="w-12 h-12 text-slate-100" strokeWidth={1} />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.5em]">Command Repository Idle</h3>
                                <p className="text-sm font-serif font-bold text-slate-300">No applications detected in this navigational view</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <ApplicationPipelineBoard
                        applications={filteredApps}
                        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                        onSelectApp={setSelectedAppId}
                    />
                )}
            </div>

            {/* Strategic Detail Drawer */}
            <div className={clsx(
                "fixed top-20 right-0 bottom-0 w-full lg:w-[30rem] bg-white border-l border-slate-100 shadow-[-32px_0_128px_-16px_rgba(0,0,0,0.08)] backdrop-blur-3xl transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] z-40 flex flex-col pt-20 pe-6 pb-20",
                selectedAppId ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedAppId && isDetailLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-[#AD03DE]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Loading dossier</p>
                    </div>
                ) : activeApplication ? (
                    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-20 duration-1000 overflow-y-auto">
                        <div className="p-10 border-b border-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50/50 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 group-hover:scale-110" />

                            <button onClick={() => setSelectedAppId(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 transition-all active:scale-90 z-10">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="relative z-10">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#AD03DE] to-indigo-600 p-1 shadow-2xl shadow-[#AD03DE]/30">
                                        <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center font-serif font-bold text-3xl text-[#AD03DE]">
                                            {(activeApplication.student_name || activeApplication.student?.name || 'S').charAt(0)}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight truncate">{activeApplication.student_name || activeApplication.student?.name}</h2>
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] truncate">Scholar Ref: {activeApplication.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {(() => {
                                        const activeStatus = activeApplication.status as ApplicationStatus;

                                        return (
                                            <span className={clsx(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border",
                                                statusColors[activeStatus] || "bg-slate-50 text-slate-400 border-slate-100"
                                            )}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                                {statusLabels[activeStatus] || activeApplication.status}
                                            </span>
                                        );
                                    })()}
                                    {activeApplication.assigned_to_details && (
                                        <span className="px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-500">
                                            Owner: {activeApplication.assigned_to_details.first_name} {activeApplication.assigned_to_details.last_name}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 mt-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academy & Program Objective</p>
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="text-lg font-serif font-bold text-slate-900 mb-2">{activeApplication.university_name_display || activeApplication.university?.name || 'University'}</div>
                                        <div className="text-[10px] font-bold text-[#AD03DE] uppercase tracking-[0.2em] opacity-70">{activeApplication.course_name_display || activeApplication.course?.name || 'Program'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-10 pt-6">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'overview', label: 'Overview', icon: ClipboardList },
                                    { key: 'checklist', label: 'Checklist', icon: ListChecks },
                                    { key: 'timeline', label: 'Timeline', icon: Clock },
                                    { key: 'notes', label: 'Notes', icon: MessageSquare },
                                    { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                        className={clsx(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                            activeTab === tab.key
                                                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                                : "bg-white text-slate-400 border-slate-100 hover:border-[#AD03DE]/30 hover:text-[#AD03DE]"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 p-10 space-y-8">
                            {activeTab === 'overview' && (
                                <>
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Command Protocol</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {statusOptions.map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => statusMutation.mutate({ id: activeApplication.id, status: status as ApplicationStatus })}
                                                    className={clsx(
                                                        "px-6 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all text-left group flex flex-col gap-2 relative overflow-hidden",
                                                        activeApplication.status === status
                                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                                            : "bg-white border border-slate-100 text-slate-400 hover:border-[#AD03DE]/30 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <span className={clsx(
                                                        "opacity-40",
                                                        activeApplication.status === status ? "text-emerald-400" : "text-slate-300 group-hover:text-[#AD03DE]"
                                                    )}>{(statusLabels[status as ApplicationStatus] || status).split(' ')[0]}</span>
                                                    <span className="text-[9px]">{statusLabels[status as ApplicationStatus] || status}</span>
                                                    {activeApplication.status === status && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                            <RotateCcw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fit Score</p>
                                            <p className="text-3xl font-serif font-bold text-slate-900">{activeApplication.fit_score ?? 0}</p>
                                        </div>
                                        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Score</p>
                                            <p className="text-3xl font-serif font-bold text-slate-900">{activeApplication.risk_score ?? 0}</p>
                                        </div>
                                        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist Progress</p>
                                            <p className="text-3xl font-serif font-bold text-slate-900">{activeApplication.checklist_progress?.percent ?? 0}%</p>
                                        </div>
                                        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Action</p>
                                            <p className="text-sm font-bold text-slate-900">{activeApplication.next_action_at ? new Date(activeApplication.next_action_at).toLocaleString() : 'Not Scheduled'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Strategic Assets & Logistics</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-[#AD03DE]/30 transition-all shadow-sm">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target Intake</p>
                                                    <p className="text-xs font-bold text-slate-900 font-mono">{activeApplication.intake_date || activeApplication.intake}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-[#AD03DE]/30 transition-all shadow-sm">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target Offer Date</p>
                                                    <p className="text-xs font-bold text-slate-900 font-mono">{activeApplication.target_offer_date || 'Not Set'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-[#AD03DE]/30 transition-all shadow-sm">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Target CAS Date</p>
                                                    <p className="text-xs font-bold text-slate-900 font-mono">{activeApplication.target_cas_date || 'Not Set'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-6">Scholar Account Engagement</p>
                                        <Link to={`/students/${activeStudentId}`} className="inline-flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group/link hover:border-[#AD03DE]/30 transition-all shadow-sm active:scale-95">
                                            <div className="w-10 h-10 rounded-xl bg-[#AD03DE]/5 flex items-center justify-center text-[#AD03DE]">
                                                <Navigation className="w-5 h-5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            </div>
                                            <span className="text-[10px] font-bold text-[#AD03DE] uppercase tracking-widest pr-4">Enter Scholar Dashboard</span>
                                        </Link>
                                    </div>
                                </>
                            )}

                            {activeTab === 'checklist' && (
                                <div className="space-y-4">
                                    {checklistItems.length === 0 ? (
                                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-100">
                                            <ListChecks className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No checklist items</p>
                                        </div>
                                    ) : (
                                        checklistItems.map((item) => (
                                            <div key={item.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.category}</p>
                                                    </div>
                                                    <span className={clsx(
                                                        "px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border",
                                                        item.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            item.status === 'UPLOADED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                item.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                {item.document_details && (
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {item.document_details.document_type} • {item.document_details.file_name}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => checklistMutation.mutate({ id: item.id, data: { status: 'VERIFIED' } })}
                                                        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg"
                                                    >
                                                        Verify
                                                    </button>
                                                    <button
                                                        onClick={() => checklistMutation.mutate({ id: item.id, data: { status: 'WAIVED' } })}
                                                        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 rounded-lg"
                                                    >
                                                        Waive
                                                    </button>
                                                    <button
                                                        onClick={() => checklistMutation.mutate({ id: item.id, data: { status: 'REJECTED' } })}
                                                        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 rounded-lg"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-4">
                                    {timeline.length === 0 ? (
                                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-100">
                                            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No status updates yet</p>
                                        </div>
                                    ) : (
                                        timeline.map((entry) => (
                                            <div key={entry.id} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {statusLabels[entry.to_status as ApplicationStatus] || entry.to_status}
                                                    </p>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                        {new Date(entry.changed_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-4">
                                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                                        <textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Add internal note..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                                            rows={3}
                                        />
                                        <button
                                            onClick={() => {
                                                if (!noteText.trim()) return;
                                                noteMutation.mutate({ application: activeApplication.id, note: noteText.trim() });
                                                setNoteText('');
                                            }}
                                            className="px-4 py-2 rounded-xl bg-[#AD03DE] text-white text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                    {applicationNotes.length === 0 ? (
                                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-100">
                                            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No notes yet</p>
                                        </div>
                                    ) : (
                                        applicationNotes.map((note) => (
                                            <div key={note.id} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2">
                                                <p className="text-sm text-slate-900">{note.note}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                    {note.created_by_details?.first_name || 'Staff'} • {new Date(note.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'tasks' && (
                                <div className="space-y-4">
                                    <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
                                        <input
                                            value={taskTitle}
                                            onChange={(e) => setTaskTitle(e.target.value)}
                                            placeholder="Task title..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                                        />
                                        <input
                                            type="datetime-local"
                                            value={taskDueDate}
                                            onChange={(e) => setTaskDueDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                                        />
                                        <button
                                            onClick={() => {
                                                if (!taskTitle.trim()) return;
                                                taskMutation.mutate({
                                                    application: activeApplication.id,
                                                    student: activeStudentId,
                                                    title: taskTitle.trim(),
                                                    due_date: taskDueDate || undefined,
                                                    priority: 'MEDIUM',
                                                    category: 'ADMISSION',
                                                });
                                                setTaskTitle('');
                                                setTaskDueDate('');
                                            }}
                                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Create Task
                                        </button>
                                    </div>
                                    {applicationTasks.length === 0 ? (
                                        <div className="text-center py-16 bg-slate-50/60 rounded-3xl border border-slate-100">
                                            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No tasks yet</p>
                                        </div>
                                    ) : (
                                        applicationTasks.map((task: Task) => (
                                            <div key={task.id} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2">
                                                <p className="text-sm font-bold text-slate-900">{task.title}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{task.status} • {task.priority}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Due: {new Date(task.due_date).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-10 border-t border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4 text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Registry ID Synchronized: {activeApplication.id}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-8 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center">
                            <Zap className="w-12 h-12 text-slate-100" strokeWidth={1} />
                        </div>
                        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em] text-center ml-2">Select an entity for strategic detail</h3>
                    </div>
                )}
            </div>

            {/* Modal/Overlay Fallback for Mobile */}
            {selectedAppId && (
                <div
                    className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-30 lg:hidden"
                    onClick={() => setSelectedAppId(null)}
                />
            )}
        </div>
    );
};

export default Applications;
