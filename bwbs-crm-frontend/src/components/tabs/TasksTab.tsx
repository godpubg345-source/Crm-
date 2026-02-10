import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    type Task,
    type TaskPriority,
    type TaskStatus,
    type TaskCreateData,
} from '../../services/tasks';

// ============================================================================
// TASKS TAB COMPONENT - BWBS Education CRM
// ============================================================================

interface TasksTabProps {
    studentId: string;
}

const customPriorityColors: Record<TaskPriority, string> = {
    LOW: 'bg-slate-50 text-slate-500 border-slate-100',
    MEDIUM: 'bg-blue-50 text-blue-600 border-blue-100',
    HIGH: 'bg-amber-50 text-amber-600 border-amber-100',
    URGENT: 'bg-rose-50 text-rose-600 border-rose-100',
};

const TasksTab = ({ studentId }: TasksTabProps) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['tasks', studentId],
        queryFn: () => getTasks({ student: studentId }),
    });

    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', studentId] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { status: TaskStatus } | Partial<TaskCreateData> }) => updateTask(id, data as Partial<TaskCreateData>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', studentId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', studentId] });
        },
    });

    const tasks = data?.results || [];
    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Indefinite Protocol';
        return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const toggleComplete = (task: Task) => {
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        updateMutation.mutate({ id: task.id, data: { status: newStatus } });
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 w-64 bg-slate-50 rounded-2xl mb-8" />
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-border" />
                ))}
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="p-12 text-center bg-rose-50/30 border border-rose-100 rounded-[2.5rem]">
                <p className="text-rose-500 font-bold uppercase tracking-widest text-[10px]">Command Center Offline</p>
                <p className="text-rose-400 text-sm mt-1">Unable to synchronize operational tasks.</p>
            </div>
        );
    }

    const displayTasks = showCompleted ? completedTasks : pendingTasks;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Nav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 font-bold">Strategic Task Board</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational milestones & daily objectives</p>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 self-start sm:self-auto">
                    <button
                        onClick={() => setShowCompleted(false)}
                        className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 ${!showCompleted
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Active ({pendingTasks.length})
                    </button>
                    <button
                        onClick={() => setShowCompleted(true)}
                        className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500 ${showCompleted
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Archived ({completedTasks.length})
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#AD03DE] hover:bg-[#9302bb] text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-[#AD03DE]/20 active:scale-95 group"
                >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Initialize Objective
                </button>
            </div>

            {/* Task List */}
            {displayTasks.length === 0 ? (
                <div className="text-center py-24 bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-8 border border-slate-100 text-[#AD03DE] shadow-xl group hover:rotate-6 transition-all duration-700">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 font-bold mb-2">
                        {showCompleted ? 'Archive is Empty' : 'Operational Equilibrium'}
                    </h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                        {showCompleted
                            ? 'No objectives have been archived yet in this dossier.'
                            : 'All current objectives for this scholar have been synchronized. Ready for new strategic maneuvers.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`flex items-center gap-6 p-5 rounded-[2rem] border transition-all duration-500 overflow-hidden relative group ${task.status === 'COMPLETED'
                                ? 'bg-slate-50/50 border-slate-100 opacity-60'
                                : 'bg-white border-border hover:border-[#AD03DE]/20 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.05)] hover:-translate-y-0.5'
                                }`}
                        >
                            {/* Checkbox Artifact */}
                            <button
                                onClick={() => toggleComplete(task)}
                                disabled={updateMutation.isPending}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 shrink-0 ${task.status === 'COMPLETED'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-500'
                                    : 'bg-slate-50 border-slate-100 group-hover:border-[#AD03DE]/30 group-hover:bg-white text-transparent'
                                    }`}
                            >
                                <svg className={`w-5 h-5 transition-transform duration-500 ${task.status === 'COMPLETED' ? 'scale-100' : 'scale-0 group-hover:scale-75 group-hover:text-slate-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-serif font-bold transition-all duration-500 ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                    {task.title}
                                </h4>
                                {task.description && (
                                    <p className={`text-xs mt-1 transition-all duration-500 ${task.status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            {/* Meta Group */}
                            <div className="hidden md:flex items-center gap-6 shrink-0">
                                {/* Due Date Artifact */}
                                <div className="text-right">
                                    <span className="block text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Deadline</span>
                                    <div className={`text-[10px] font-bold flex items-center gap-1.5 ${task.status !== 'COMPLETED' && isOverdue(task.due_date)
                                        ? 'text-rose-500'
                                        : 'text-slate-400'
                                        }`}>
                                        {task.status !== 'COMPLETED' && isOverdue(task.due_date) && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        )}
                                        {formatDate(task.due_date)}
                                    </div>
                                </div>

                                {/* Priority Badge */}
                                <span className={`px-3 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-widest transition-colors ${customPriorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>

                                {/* Delete Artifact */}
                                <button
                                    onClick={() => deleteMutation.mutate(task.id)}
                                    disabled={deleteMutation.isPending}
                                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-500"
                                    title="Decommission Objective"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Task Modal */}
            {isModalOpen && (
                <AddTaskModal
                    studentId={studentId}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(data) => createMutation.mutate(data)}
                    isLoading={createMutation.isPending}
                />
            )}
        </div>
    );
};

// Modal Component
const AddTaskModal = ({
    studentId,
    onClose,
    onSubmit,
    isLoading,
}: {
    studentId: string;
    onClose: () => void;
    onSubmit: (data: TaskCreateData) => void;
    isLoading: boolean;
}) => {
    const [formData, setFormData] = useState<TaskCreateData>({
        student: studentId,
        title: '',
        description: '',
        due_date: '',
        priority: 'MEDIUM',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title.trim()) {
            onSubmit({
                ...formData,
                due_date: formData.due_date || undefined,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] border border-white relative z-50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 font-bold">New Objective</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational induction sequence</p>
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

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Objective Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-serif font-bold text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            placeholder="Brief protocol title..."
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contextual Details</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-medium text-sm placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all h-24 resize-none leading-relaxed"
                            placeholder="Optional operational breakdown..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deadline Sequence</label>
                            <input
                                type="date"
                                value={formData.due_date || ''}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-xs focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all"
                            />
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Strategic Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all appearance-none cursor-pointer"
                            >
                                <option value="LOW">Low Latency</option>
                                <option value="MEDIUM">Standard Protocol</option>
                                <option value="HIGH">High Fidelity</option>
                                <option value="URGENT">Immediate Action</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                        >
                            Abort Protocol
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.title.trim()}
                            className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95 flex items-center gap-3"
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Commit Objective
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TasksTab;
