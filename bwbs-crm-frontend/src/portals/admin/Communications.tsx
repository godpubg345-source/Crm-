import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCommunication,
    getCommunications,
    type CommunicationCreateData,
    type CommunicationDirection,
    type CommunicationType,
} from '../../services/communications';
import { getStudents } from '../../services/students';
import {
    Plus,
    Search,
    RotateCcw,
    Loader2,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    User,
    ChevronRight,
    X,
    Zap,
    Navigation,
    BookOpen,
    ShieldCheck,
    Phone,
    Mail,
    MessageSquare,
    Users,
    ExternalLink,
    type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// COMMUNICATIONS - GLOBAL ENGAGEMENT REGISTRY
// ============================================================================

const typeConfig: Record<CommunicationType, { icon: LucideIcon, color: string, bg: string, border: string }> = {
    CALL: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    EMAIL: { icon: Mail, color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/5', border: 'border-[#7c3aed]/10' },
    SMS: { icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    MEETING: { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    WHATSAPP: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    OTHER: { icon: Zap, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' },
};

type StudentOption = {
    id: string;
    student_code?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
};

const formatStudentOption = (student: StudentOption) => {
    const name = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Account';
    const code = student.student_code ? `(${student.student_code})` : '';
    return `${name} ${code}`.trim();
};

const Communications = () => {
    const queryClient = useQueryClient();
    const [communicationType, setCommunicationType] = useState<CommunicationType | ''>('');
    const [direction, setDirection] = useState<CommunicationDirection | ''>('');
    const [studentSearch, setStudentSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [ordering] = useState('-created_at');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: appsResponse, isLoading, isError } = useQuery({
        queryKey: ['communications', communicationType, direction, searchQuery, ordering, page],
        queryFn: () => getCommunications({
            communication_type: communicationType,
            direction,
            search: searchQuery,
            ordering,
            page,
        }),
    });

    const { data: studentData } = useQuery({
        queryKey: ['students', studentSearch],
        queryFn: () => getStudents(1, studentSearch),
        enabled: studentSearch.length === 0 || studentSearch.length >= 2,
    });

    const studentOptions = (studentData?.results || []) as StudentOption[];

    const createMutation = useMutation({
        mutationFn: createCommunication,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communications'] });
            setIsModalOpen(false);
        },
    });

    if (isLoading && !appsResponse) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs text-slate-500">Interactions</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-6 animate-in fade-in duration-200 ease-out pe-6 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Communication Log</h1>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 opacity-60">Every call, email and meeting with students</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-200">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#7c3aed]/10 focus-within:border-[#7c3aed]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder:text-slate-300 w-48"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-1" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 group"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 transition-transform duration-200" />
                        Log interaction
                    </button>
                </div>
            </div>

            {/* Strategic Filters Cluster */}
            <div className="flex flex-wrap items-end gap-6 bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

                <div className="w-full lg:w-48 space-y-3">
                    <label className="text-xs text-slate-500 ml-1 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Channel
                    </label>
                    <select
                        value={communicationType}
                        onChange={(e) => { setCommunicationType(e.target.value as CommunicationType | ''); setPage(1); }}
                        className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Channels</option>
                        <option value="CALL">Voice Call</option>
                        <option value="EMAIL">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="MEETING">Meeting</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div className="w-full lg:w-48 space-y-3">
                    <label className="text-xs text-slate-500 ml-1 flex items-center gap-2">
                        <Navigation className="w-3 h-3" />
                        Direction
                    </label>
                    <select
                        value={direction}
                        onChange={(e) => { setDirection(e.target.value as CommunicationDirection | ''); setPage(1); }}
                        className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All directions</option>
                        <option value="INBOUND">Inbound</option>
                        <option value="OUTBOUND">Outbound</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[300px] space-y-3">
                    <label className="text-xs text-slate-500 ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Student
                    </label>
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <input
                                value={studentSearch}
                                onChange={(e) => { setStudentSearch(e.target.value); setPage(1); }}
                                placeholder="Search students..."
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                        </div>
                        <select
                            value={''} // This select is now only for display, student filter is handled by studentSearch
                            onChange={() => { /* No direct student filter from this select */ }}
                            className="flex-1 pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 appearance-none cursor-pointer"
                        >
                            <option value="">All students</option>
                            {studentOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {formatStudentOption(option)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSearchQuery('');
                        setCommunicationType('');
                        setDirection('');
                        setStudentSearch('');
                        setPage(1);
                    }}
                    className="p-4 bg-slate-900 border border-slate-900 text-white rounded-2xl shadow-sm hover:bg-black transition-all group"
                    title="Clear filters"
                >
                    <RotateCcw className="w-5 h-5 transition-transform" />
                </button>
            </div>

            {/* Engagement Stream */}
            <div className="space-y-8">
                {isError && (
                    <div className="p-20 text-center text-rose-500 bg-white rounded-xl border border-slate-200">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-xs font-bold">Couldn't load the log</h4>
                        <p className="text-[11px] text-slate-500 mt-2">Something went wrong while loading. Please try again.</p>
                    </div>
                )}

                {!isError && (appsResponse?.results || []).length === 0 ? (
                    <div className="p-20 text-center text-slate-300 bg-white rounded-xl border border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group">
                            <MessageSquare className="w-12 h-12 text-slate-100 transition-transform duration-200" strokeWidth={1} />
                        </div>
                        <h4 className="text-xs text-slate-500">No interactions yet</h4>
                        <p className="text-[11px] font-bold text-slate-300 mt-2">Calls, emails and meetings you log will show up here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {appsResponse?.results.map((log) => {
                            const config = typeConfig[log.communication_type] || typeConfig.OTHER;
                            const LogIcon = config.icon;
                            return (
                                <div
                                    key={log.id}
                                    className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-[#7c3aed]/20 transition-all duration-200 relative overflow-hidden"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className={clsx(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-sm ",
                                                config.bg, config.color, config.border, "group-hover:bg-white"
                                            )}>
                                                <LogIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                                                        {log.student_details?.full_name || log.student}
                                                    </h3>
                                                    <div className={clsx(
                                                        "px-3 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-2",
                                                        log.direction === 'INBOUND' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-[#7c3aed]/5 text-[#7c3aed] border-[#7c3aed]/10"
                                                    )}>
                                                        {log.direction === 'INBOUND' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {log.direction_display || log.direction}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-xs font-bold text-[#7c3aed]">{log.subject || 'Interaction'}</p>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] text-white font-bold">SY</div>
                                                <span className="text-[11px] text-slate-500">Logged by</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 overflow-hidden">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:bg-white transition-all duration-200 relative group/summary">
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed font-bold pr-12">"{log.summary}"</p>

                                            {(log.next_action || log.follow_up_at) && (
                                                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6">
                                                    {log.next_action && (
                                                        <div className="space-y-2">
                                                            <p className="text-[11px] font-bold text-slate-300">Next step</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/5 flex items-center justify-center text-[#7c3aed]">
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900">{log.next_action}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {log.follow_up_at && (
                                                        <div className="space-y-2">
                                                            <p className="text-[11px] font-bold text-slate-300">Scheduled Follow-up</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                                    <Calendar className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">{new Date(log.follow_up_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button className="absolute bottom-8 right-8 p-3.5 bg-white rounded-xl border border-slate-200 text-slate-300 hover:text-[#7c3aed] transition-all opacity-0 group-hover/summary:opacity-100">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Stream Navigation */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-slate-200 gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-sm">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 leading-none mb-1">interactions</p>
                                    <p className="text-sm font-bold text-slate-900 font-mono tracking-tight tabular-nums">{appsResponse?.count || 0} Interactions Resolved</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={!appsResponse?.previous}
                                    className="px-8 py-3.5 text-xs text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!appsResponse?.next}
                                    className="px-8 py-3.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 flex items-center gap-3 group"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <LogCommunicationModal
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(payload: CommunicationCreateData) => createMutation.mutate(payload)}
                    isSubmitting={createMutation.isPending}
                />
            )}
        </div>
    );
};

interface LogCommunicationModalProps {
    onClose: () => void;
    onSubmit: (data: CommunicationCreateData) => void;
    isSubmitting: boolean;
}

const LogCommunicationModal = ({ onClose, onSubmit, isSubmitting }: LogCommunicationModalProps) => {
    const [formData, setFormData] = useState<CommunicationCreateData>({
        student: '',
        communication_type: 'CALL',
        direction: 'OUTBOUND',
        subject: '',
        summary: '',
        next_action: '',
        follow_up_at: null,
    });
    const [studentSearch, setStudentSearch] = useState('');

    const { data: studentData } = useQuery({
        queryKey: ['students', studentSearch],
        queryFn: () => getStudents(1, studentSearch),
        enabled: studentSearch.length === 0 || studentSearch.length >= 2,
    });

    const studentOptions = (studentData?.results || []) as StudentOption[];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 animate-in fade-in duration-200" onClick={onClose} />
            <div className="bg-white rounded-xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-200 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div>
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 mb-6 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[#7c3aed]" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Log an Interaction</h2>
                        <p className="text-xs text-slate-500 mt-2">Record a call, email or meeting</p>
                    </div>
                    <button onClick={onClose} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200 transition-all bg-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto premium-scrollbar bg-white">
                    {/* Student Selection Cluster */}
                    <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1 flex items-center gap-2">
                                <Search className="w-3 h-3 text-[#7c3aed]" />
                                Student
                            </label>
                            <input
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                placeholder="Search students..."
                                className="w-full pl-6 pr-6 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Choose student
                            </label>
                            <select
                                value={formData.student}
                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                className="w-full pl-6 pr-10 py-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none cursor-pointer"
                            >
                                <option value="">Select a student</option>
                                {studentOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {formatStudentOption(option)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1">Channel</label>
                            <select
                                value={formData.communication_type}
                                onChange={(e) => setFormData({ ...formData, communication_type: e.target.value as CommunicationType })}
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 appearance-none cursor-pointer"
                            >
                                <option value="CALL">Voice Call</option>
                                <option value="EMAIL">Email</option>
                                <option value="SMS">SMS</option>
                                <option value="MEETING">Meeting</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1">Direction</label>
                            <select
                                value={formData.direction}
                                onChange={(e) => setFormData({ ...formData, direction: e.target.value as CommunicationDirection })}
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 appearance-none cursor-pointer"
                            >
                                <option value="OUTBOUND">Outbound</option>
                                <option value="INBOUND">Inbound</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs text-slate-500 ml-1">Subject</label>
                        <input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="e.g. Discussed UK options"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs text-slate-500 ml-1">Summary</label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            rows={4}
                            placeholder="What was discussed?"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all resize-none bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1">Next step</label>
                            <input
                                value={formData.next_action || ''}
                                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                                placeholder="e.g. Send IELTS booking link"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs text-slate-500 ml-1">Follow-up date</label>
                            <input
                                type="datetime-local"
                                value={formData.follow_up_at || ''}
                                onChange={(e) => setFormData({ ...formData, follow_up_at: e.target.value || null })}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-50 flex justify-end gap-6 bg-slate-50/20">
                    <button onClick={onClose} className="px-6 py-4 text-xs text-slate-500 hover:text-slate-900 transition-all">Cancel</button>
                    <button
                        onClick={() => onSubmit(formData)}
                        disabled={isSubmitting || !formData.student || !formData.summary}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 disabled:opacity-20 group"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400 transition-transform" />}
                        Finalize Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Communications;
