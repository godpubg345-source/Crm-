import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentById, updateStudent, type Student, type StudentCreateData } from '../services/students';
import DocumentsTab from '../components/tabs/DocumentsTab';
import ApplicationsTab from '../components/tabs/ApplicationsTab';
import VisaTab from '../components/tabs/VisaTab';
import FinanceTab from '../components/tabs/FinanceTab';
import TasksTab from '../components/tabs/TasksTab';
import CommunicationsTab from '../components/tabs/CommunicationsTab';
import SmartMatchWidget from '../components/students/SmartMatchWidget';
import { WhatsAppWidget } from '../components/students/WhatsAppWidget';
import ActivityFeed from '../components/students/ActivityFeed';
import StudentJourneyMap, { type JourneyStage } from '../components/students/StudentJourneyMap';
import QuickActionsBar from '../components/students/QuickActionsBar';
import { getApplications } from '../services/applications';
import { createCommunication } from '../services/communications';
import { createTask } from '../services/tasks';

// ============================================================================
// STUDENT DETAIL PAGE - BWBS Education CRM
// ============================================================================

const statusColors: Record<Student['status'], string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    ON_HOLD: 'bg-amber-50 text-amber-600 border-amber-100',
    ENROLLED: 'bg-blue-50 text-blue-600 border-blue-100',
    WITHDRAWN: 'bg-rose-50 text-rose-600 border-rose-100',
};

type TabKey = 'overview' | 'applications' | 'documents' | 'visa' | 'finance' | 'tasks' | 'communications' | 'matcher';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
        key: 'overview',
        label: 'Overview',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        key: 'applications',
        label: 'Applications',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        key: 'documents',
        label: 'Documents',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        key: 'visa',
        label: 'Visa',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    },
    {
        key: 'finance',
        label: 'Finance',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'tasks',
        label: 'Tasks',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        key: 'communications',
        label: 'Comms',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m9-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        key: 'matcher',
        label: 'AI Matcher',
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
];

// Helper Components
const InfoItem = ({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#AD03DE] group-hover:bg-[#AD03DE] group-hover:text-white transition-all shadow-inner">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm text-slate-900 font-bold truncate ${mono ? 'font-mono' : 'font-serif'}`}>{value}</p>
        </div>
    </div>
);

const infoIcons = {
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 5a2 2 0 012-2h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 012 5z" />
        </svg>
    ),
    passport: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h4m-4 4h4m4-4h6" />
        </svg>
    ),
    nationality: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
    ),
    branch: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
        </svg>
    ),
    counselor: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
};

const OverviewTab = ({ student }: { student: Student }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-8 border border-border shadow-sm group hover:shadow-xl hover:border-[#AD03DE]/10 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    Enrolled Since
                </p>
                <p className="text-2xl font-serif font-bold text-slate-900 relative z-10">{new Date(student.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-border shadow-sm group hover:shadow-xl hover:border-[#AD03DE]/10 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-100/50 transition-colors" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Dossier Last Updated
                </p>
                <p className="text-2xl font-serif font-bold text-slate-900 relative z-10">{new Date(student.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })}</p>
            </div>

            {/* New Quick Stats Row */}
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all">
                    <span className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-[#AD03DE] transition-colors">0</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Applications</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all">
                    <span className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-emerald-500 transition-colors">0</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Offers</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all">
                    <span className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-rose-500 transition-colors">0</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Tasks</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-md transition-all">
                    <span className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-blue-500 transition-colors">0%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visa Prob.</span>
                </div>
            </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-serif font-bold text-slate-900">Activity Stream</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time systemic & communication logs</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live sync active</span>
                </div>
            </div>

            <ActivityFeed studentId={student.id} />
        </div>
    </div>
);


// Log Call Modal
const LogCallModal = ({ studentId, onClose, onSuccess }: { studentId: string; onClose: () => void; onSuccess: () => void }) => {
    const [summary, setSummary] = useState('');
    const [direction, setDirection] = useState<'INBOUND' | 'OUTBOUND'>('OUTBOUND');

    const mutation = useMutation({
        mutationFn: () => createCommunication({
            student: studentId,
            communication_type: 'CALL',
            direction,
            summary,
            subject: 'Call Log'
        }),
        onSuccess: () => {
            onSuccess();
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-8">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Log Call</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDirection('OUTBOUND')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${direction === 'OUTBOUND' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                            >
                                Outbound
                            </button>
                            <button
                                onClick={() => setDirection('INBOUND')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${direction === 'INBOUND' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                            >
                                Inbound
                            </button>
                        </div>
                        <textarea
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            placeholder="Call summary..."
                            className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all resize-none"
                        />
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancel</button>
                            <button
                                onClick={() => mutation.mutate()}
                                disabled={!summary || mutation.isPending}
                                className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Logging...' : 'Log Call'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Note Modal
const AddNoteModal = ({ studentId, onClose, onSuccess }: { studentId: string; onClose: () => void; onSuccess: () => void }) => {
    const [note, setNote] = useState('');

    const mutation = useMutation({
        mutationFn: () => createCommunication({
            student: studentId,
            communication_type: 'OTHER',
            direction: 'OUTBOUND', // Default
            summary: note,
            subject: 'Note'
        }),
        onSuccess: () => {
            onSuccess();
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-8">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Add Note</h2>
                    <div className="space-y-4">
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Type your note here..."
                            className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all resize-none"
                        />
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancel</button>
                            <button
                                onClick={() => mutation.mutate()}
                                disabled={!note || mutation.isPending}
                                className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// New Task Modal
const NewTaskModal = ({ studentId, onClose, onSuccess }: { studentId: string; onClose: () => void; onSuccess: () => void }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

    // We need to import createTask. Since we are inside a function component we can't use top level await for imports if we weren't already.
    // However, we should import these at the top of the file properly. 
    // For this ReplaceBlock, I will assume I can update imports later or use a require-like pattern if needed, 
    // but better to just ADD the imports to the top of the file in a separate chunk.
    // I'll leave the implementation logic here.

    // Actually, I'll just use the globally available imported functions if I add them to imports list.
    // Let's assume `createTask` is imported or available.
    // I will include the logic assuming `createTask` is passed or imported.

    const mutation = useMutation({
        mutationFn: () => createTask({
            student: studentId,
            title,
            priority,
            due_date: new Date(dueDate).toISOString(),
            // status is assigned by backend default
        }),
        onSuccess: () => {
            onSuccess();
            onClose();
        }
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-8">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">New Task</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as any)}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Cancel</button>
                            <button
                                onClick={() => mutation.mutate()}
                                disabled={!title || !dueDate || mutation.isPending}
                                className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Modal Component
const EditStudentModal = ({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) => {
    const [formData, setFormData] = useState<Partial<StudentCreateData>>({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
        passport_number: student.passport_number,
        nationality: student.nationality,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<StudentCreateData>) => updateStudent(student.id, data),
        onSuccess: onSuccess,
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">Edit Profile</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Update student information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name || ''}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-serif font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name || ''}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-serif font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Corporate Email Address</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Contact Number</label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Passport Credentials</label>
                            <input
                                type="text"
                                value={formData.passport_number || ''}
                                onChange={e => setFormData({ ...formData, passport_number: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Citizenship / Nationality</label>
                            <input
                                type="text"
                                value={formData.nationality || ''}
                                onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                        >
                            Abort Changes
                        </button>
                        <button
                            onClick={() => updateMutation.mutate(formData)}
                            disabled={updateMutation.isPending}
                            className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95 flex items-center gap-3"
                        >
                            {updateMutation.isPending ? 'Synchronizing...' : (
                                <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Commit Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const StudentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: student, isLoading, isError, error } = useQuery({
        queryKey: ['student', id],
        queryFn: () => getStudentById(id!),
        enabled: !!id,
    });

    const { data: applicationsData } = useQuery({
        queryKey: ['applications', id],
        queryFn: () => getApplications({ student: id }),
        enabled: !!id,
    });

    // Calculate Journey Stage
    const currentStage: JourneyStage = (() => {
        if (!student) return 'LEAD';
        if (student.status === 'ENROLLED') return 'ENROLLED';

        const apps = applicationsData?.results || [];
        const hasVisa = apps.some(a => ['CAS_REQUESTED', 'CAS_RECEIVED'].includes(a.status));
        const hasOffer = apps.some(a => ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED'].includes(a.status));
        const hasApplied = apps.length > 0;

        if (hasVisa) return 'VISA_FILING';
        if (hasOffer) return 'OFFER_RECEIVED';
        if (hasApplied) return 'APPLIED';
        if (student.profile_completeness === 100) return 'PROFILE_READY';

        return 'LEAD';
    })();

    // State for Quick Action Modals
    const [isLogCallOpen, setIsLogCallOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

    // Quick Action Handlers
    const handleLogCall = () => setIsLogCallOpen(true);
    const handleAddNote = () => setIsAddNoteOpen(true);
    const handleAddTask = () => setIsNewTaskOpen(true);
    const handleSendEmail = () => window.location.href = `mailto:${student?.email}`;

    // Loading State
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-10 bg-slate-200 rounded-lg w-64" />
                        <div className="h-4 bg-slate-100 rounded w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="h-64 bg-slate-50 rounded-2xl" />
                        <div className="h-48 bg-slate-50 rounded-2xl" />
                    </div>
                    <div className="lg:col-span-2 h-[600px] bg-slate-50 rounded-2xl" />
                </div>
            </div>
        );
    }

    // Error State
    if (isError || !student) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-border shadow-sm">
                <div className="w-24 h-24 rounded-3xl bg-rose-50 flex items-center justify-center mb-8 border border-rose-100">
                    <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Student Not Found</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-sm text-center">{(error as Error)?.message || 'We was unable to retrieve the requested student dossier at this time.'}</p>
                <button
                    onClick={() => navigate('/students')}
                    className="px-8 py-4 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-slate-200"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    const counselorName = (() => {
        const details = student.counselor_details;
        if (!details) return 'Unassigned';
        const fullName = `${details.first_name || ''} ${details.last_name || ''}`.trim();
        return fullName || details.email || 'Unassigned';
    })();
    const branchName = student.branch_details?.name || 'N/A';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
            {/* Header / Profile Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/students')}
                        className="p-3.5 text-slate-400 hover:text-[#AD03DE] bg-white border border-border rounded-2xl transition-all shadow-sm hover:shadow-xl hover:-translate-x-1 active:scale-90"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#AD03DE] via-brand-600 to-indigo-900 flex items-center justify-center text-white font-serif font-bold text-4xl shadow-[0_20px_50px_rgba(173,3,222,0.3)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            {(student.first_name || '').charAt(0)}{(student.last_name || '').charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-5xl font-bold text-slate-900 font-serif tracking-tight leading-none">
                                    {student.first_name} {student.last_name}
                                </h1>
                                <span className={`px-4 py-1.5 rounded-2xl border text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm ${statusColors[student.status]}`}>
                                    {student.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                                <span className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 text-xs font-mono font-bold text-indigo-600 shadow-inner">
                                    {student.student_code}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-slate-400 font-serif font-bold text-base">Student since {new Date(student.created_at).getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 self-end lg:self-center">
                    <WhatsAppWidget
                        studentId={student.id}
                        studentName={`${student.first_name} ${student.last_name}`}
                        phoneNumber={student.phone || ''}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['communications', student.id] })}
                    />
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-2xl border border-border transition-all flex items-center gap-3 shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                    >
                        <svg className="w-4 h-4 text-[#AD03DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Update Profile
                    </button>
                    <button className="p-4 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Visual Journey Map */}
            <div className="bg-white rounded-[2rem] p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#AD03DE]" />
                        Scholar Journey Lifecycle
                    </h3>
                    <QuickActionsBar
                        onLogCall={handleLogCall}
                        onAddNote={handleAddNote}
                        onAddTask={handleAddTask}
                        onSendEmail={handleSendEmail}
                    />
                </div>
                <StudentJourneyMap currentStage={currentStage} />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Side Panel - Essential Intelligence */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#AD03DE]/5 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-[#AD03DE]/10 transition-colors duration-1000" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#AD03DE] shadow-[0_0_8px_rgba(173,3,222,0.5)]" />
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <InfoItem icon={infoIcons.email} label="Email Address" value={student.email} />
                            <InfoItem icon={infoIcons.phone} label="Phone Line" value={student.phone || 'Not provided'} />
                            <InfoItem icon={infoIcons.passport} label="Passport Credentials" value={student.passport_number || 'Not provided'} mono />
                            <InfoItem icon={infoIcons.nationality} label="Citizenship / Nationality" value={student.nationality || 'Not provided'} />
                            <InfoItem icon={infoIcons.branch} label="Institutional Branch" value={branchName} />
                            <InfoItem icon={infoIcons.counselor} label="Assigned Strategic Counselor" value={counselorName} />
                        </div>
                    </div>

                    {/* Compliance Artifact */}
                    <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Compliance Status
                        </h3>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-4xl font-serif font-bold text-[#AD03DE] tracking-tighter">{student.profile_completeness}%</span>
                            </div>
                            <div className="relative">
                                <div className="h-4 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-[#AD03DE] to-emerald-500 rounded-full transition-all duration-1500 ease-out shadow-[0_0_20px_rgba(173,3,222,0.3)]"
                                        style={{ width: `${student.profile_completeness}%` }}
                                    />
                                </div>
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#AD03DE]/0 via-[#AD03DE]/5 to-emerald-500/0 blur-xl opacity-50" />
                            </div>
                            {student.profile_completeness < 100 && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
                                    Complete the profile to improve admission chances.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tactical Content Area - Tabs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] border border-border shadow-[0_10px_40px_-20px_rgba(0,0,0,0.05)] overflow-hidden min-h-[700px] flex flex-col">
                        {/* High-Fidelity Tab Navigation */}
                        <div className="border-b border-slate-100 bg-slate-50/20 px-4">
                            <div className="flex items-center gap-1 overflow-x-auto premium-scrollbar scroll-smooth pb-px">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-3 px-8 py-7 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group flex-shrink-0
                                                ${isActive
                                                    ? 'text-slate-900 bg-white'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <span className={`transition-all duration-700 ${isActive ? 'scale-125 rotate-6 text-[#AD03DE]' : 'group-hover:scale-110 group-hover:text-slate-600'}`}>
                                                {tab.icon}
                                            </span>
                                            {tab.label}
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#AD03DE] to-indigo-600 rounded-t-full shadow-[0_-4px_12px_rgba(173,3,222,0.3)] animate-in slide-in-from-bottom-2 duration-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Artifact Viewport */}
                        <div className="p-10 flex-1 relative">
                            {/* Content Transitions */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                {activeTab === 'overview' && <OverviewTab student={student} />}
                                {activeTab === 'applications' && <ApplicationsTab studentId={id!} />}
                                {activeTab === 'documents' && <DocumentsTab studentId={id!} />}
                                {activeTab === 'visa' && <VisaTab studentId={id!} nationality={student.nationality} />}
                                {activeTab === 'finance' && <FinanceTab studentId={id!} />}
                                {activeTab === 'tasks' && <TasksTab studentId={id!} />}
                                {activeTab === 'communications' && <CommunicationsTab studentId={id!} />}
                                {activeTab === 'matcher' && <SmartMatchWidget student={{ id: id!, first_name: student.first_name, last_name: student.last_name }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Modals Interface */}
            {isEditModalOpen && (
                <EditStudentModal
                    student={student}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['student', id] });
                        setIsEditModalOpen(false);
                    }}
                />
            )}

            {isLogCallOpen && (
                <LogCallModal
                    studentId={id!}
                    onClose={() => setIsLogCallOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['communications', id] });
                        queryClient.invalidateQueries({ queryKey: ['student', id] }); // Refresh activity feed too
                    }}
                />
            )}

            {isAddNoteOpen && (
                <AddNoteModal
                    studentId={id!}
                    onClose={() => setIsAddNoteOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['communications', id] });
                        queryClient.invalidateQueries({ queryKey: ['student', id] });
                    }}
                />
            )}

            {isNewTaskOpen && (
                <NewTaskModal
                    studentId={id!}
                    onClose={() => setIsNewTaskOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['tasks', id] });
                        queryClient.invalidateQueries({ queryKey: ['student', id] });
                    }}
                />
            )}
        </div>
    );
};

export default StudentDetail;
