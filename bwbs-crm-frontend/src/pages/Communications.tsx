import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createCommunication,
    getCommunications,
    type CommunicationCreateData,
    type CommunicationDirection,
    type CommunicationType,
} from '../services/communications';
import { getStudents } from '../services/students';
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
    EMAIL: { icon: Mail, color: 'text-[#AD03DE]', bg: 'bg-[#AD03DE]/5', border: 'border-[#AD03DE]/10' },
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Chronological interaction sync</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-bold text-slate-900 font-bold tracking-tight leading-none">Engagement Registry</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6 opacity-60">Global interaction tracking � Engagement chronology</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE]" />
                        <input
                            type="text"
                            placeholder="Query Logs..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-800 placeholder:text-slate-300 w-48 uppercase tracking-widest"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-1" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-500" />
                        Log Interaction
                    </button>
                </div>
            </div>

            {/* Strategic Filters Cluster */}
            <div className="flex flex-wrap items-end gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

                <div className="w-full lg:w-48 space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Channel
                    </label>
                    <select
                        value={communicationType}
                        onChange={(e) => { setCommunicationType(e.target.value as CommunicationType | ''); setPage(1); }}
                        className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                    >
                        <option value="">All Channels</option>
                        <option value="CALL">Voice Call</option>
                        <option value="EMAIL">Email Network</option>
                        <option value="SMS">SMS Gateway</option>
                        <option value="MEETING">Physical/Virtual Session</option>
                        <option value="WHATSAPP">WhatsApp Secure</option>
                        <option value="OTHER">Other Vectors</option>
                    </select>
                </div>

                <div className="w-full lg:w-48 space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Navigation className="w-3 h-3" />
                        Flow
                    </label>
                    <select
                        value={direction}
                        onChange={(e) => { setDirection(e.target.value as CommunicationDirection | ''); setPage(1); }}
                        className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                    >
                        <option value="">Global Direction</option>
                        <option value="INBOUND">Inbound Node</option>
                        <option value="OUTBOUND">Outbound Command</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[300px] space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Scholar Account
                    </label>
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <input
                                value={studentSearch}
                                onChange={(e) => { setStudentSearch(e.target.value); setPage(1); }}
                                placeholder="Query Scholars..."
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all uppercase tracking-widest"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                        </div>
                        <select
                            value={''} // This select is now only for display, student filter is handled by studentSearch
                            onChange={() => { /* No direct student filter from this select */ }}
                            className="flex-1 pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="">Strategic Select</option>
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
                    className="p-4 bg-slate-900 border border-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 group"
                    title="Purge Filters"
                >
                    <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
                </button>
            </div>

            {/* Engagement Stream */}
            <div className="space-y-8">
                {isError && (
                    <div className="p-20 text-center text-rose-500 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em]">Historical Breach</h4>
                        <p className="text-[11px] font-serif font-bold text-slate-400 mt-2">Log retrieval protocol terminated unexpectedly.</p>
                    </div>
                )}

                {!isError && (appsResponse?.results || []).length === 0 ? (
                    <div className="p-20 text-center text-slate-300 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner group">
                            <MessageSquare className="w-12 h-12 text-slate-100 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Zero Engagement Tracked</h4>
                        <p className="text-[11px] font-serif font-bold text-slate-300 mt-2">No historical interaction nodes detected in the current domain.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {appsResponse?.results.map((log) => {
                            const config = typeConfig[log.communication_type] || typeConfig.OTHER;
                            const LogIcon = config.icon;
                            return (
                                <div
                                    key={log.id}
                                    className="group bg-white p-10 rounded-[3rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 relative overflow-hidden"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className={clsx(
                                                "w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 group-hover:rotate-6 shadow-sm group-hover:shadow-lg",
                                                config.bg, config.color, config.border, "group-hover:bg-white"
                                            )}>
                                                <LogIcon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    <h3 className="text-2xl font-serif font-bold font-bold text-slate-900 group-hover:text-[#AD03DE] transition-colors">
                                                        {log.student_details?.full_name || log.student}
                                                    </h3>
                                                    <div className={clsx(
                                                        "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.2em] border flex items-center gap-2",
                                                        log.direction === 'INBOUND' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-[#AD03DE]/5 text-[#AD03DE] border-[#AD03DE]/10"
                                                    )}>
                                                        {log.direction === 'INBOUND' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {log.direction_display || log.direction}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[10px] font-bold text-[#AD03DE] uppercase tracking-[0.2em]">{log.subject || 'Strategic Interaction'}</p>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] text-white font-bold">SY</div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logged by Command</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 overflow-hidden">
                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner group-hover:bg-white transition-all duration-700 relative group/summary">
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed font-bold pr-12">"{log.summary}"</p>

                                            {(log.next_action || log.follow_up_at) && (
                                                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-10">
                                                    {log.next_action && (
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Next Deployment</p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-[#AD03DE]/5 flex items-center justify-center text-[#AD03DE]">
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-900">{log.next_action}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {log.follow_up_at && (
                                                        <div className="space-y-2">
                                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Scheduled Follow-up</p>
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

                                            <button className="absolute bottom-8 right-8 p-3.5 bg-white rounded-2xl border border-slate-100 text-slate-300 hover:text-[#AD03DE] transition-all active:scale-90 shadow-sm opacity-0 group-hover/summary:opacity-100">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Stream Navigation */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Engagements Sync</p>
                                    <p className="text-sm font-bold text-slate-900 font-mono tracking-tighter tabular-nums">{appsResponse?.count || 0} Interactions Resolved</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={!appsResponse?.previous}
                                    className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 shadow-sm active:scale-95 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!appsResponse?.next}
                                    className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 shadow-sm active:scale-95 flex items-center gap-3 group"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 overflow-hidden border border-white flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div>
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 mb-6 flex items-center justify-center shadow-sm">
                            <Plus className="w-6 h-6 text-[#AD03DE]" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 font-bold tracking-tight">Log Strategic Interaction</h2>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-[0.4em]">Induct new node into chronology</p>
                    </div>
                    <button onClick={onClose} className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-90 bg-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8 overflow-y-auto premium-scrollbar bg-white/50">
                    {/* Student Selection Cluster */}
                    <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Search className="w-3 h-3 text-[#AD03DE]" />
                                Locate Scholar
                            </label>
                            <input
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                placeholder="Query Scholars..."
                                className="w-full pl-6 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 focus:ring-4 focus:ring-[#AD03DE]/10 transition-all uppercase tracking-widest shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Selection Target
                            </label>
                            <select
                                value={formData.student}
                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                className="w-full pl-6 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 appearance-none cursor-pointer uppercase tracking-widest shadow-sm"
                            >
                                <option value="">Select Authenticated Account</option>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Channel Vector</label>
                            <select
                                value={formData.communication_type}
                                onChange={(e) => setFormData({ ...formData, communication_type: e.target.value as CommunicationType })}
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 appearance-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="CALL">Voice Call</option>
                                <option value="EMAIL">Email Network</option>
                                <option value="SMS">SMS Gateway</option>
                                <option value="MEETING">Physical/Virtual Session</option>
                                <option value="WHATSAPP">WhatsApp Secure</option>
                                <option value="OTHER">Other Vectors</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Transmission Direction</label>
                            <select
                                value={formData.direction}
                                onChange={(e) => setFormData({ ...formData, direction: e.target.value as CommunicationDirection })}
                                className="w-full pl-6 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 appearance-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="OUTBOUND">Outbound Command</option>
                                <option value="INBOUND">Inbound Node</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Strategic Subject</label>
                        <input
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Briefly Title Interaction..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 focus:ring-4 focus:ring-[#AD03DE]/10 transition-all uppercase tracking-widest"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Comprehensive Intelligence Brief</label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            rows={4}
                            placeholder="Detail Interaction Outcome..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:ring-4 focus:ring-[#AD03DE]/10 transition-all resize-none shadow-inner bg-white/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tactical Next Action</label>
                            <input
                                value={formData.next_action || ''}
                                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                                placeholder="Future Deployment..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 transition-all uppercase tracking-widest"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Follow-up Node</label>
                            <input
                                type="datetime-local"
                                value={formData.follow_up_at || ''}
                                onChange={(e) => setFormData({ ...formData, follow_up_at: e.target.value || null })}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t border-slate-50 flex justify-end gap-6 bg-slate-50/20">
                    <button onClick={onClose} className="px-10 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">Abstain</button>
                    <button
                        onClick={() => onSubmit(formData)}
                        disabled={isSubmitting || !formData.student || !formData.summary}
                        className="px-12 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-20 group"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
                        Finalize Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Communications;
