import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empGetMyTasks, empUpdateTask, empCreateTask, empGetMyProfile } from '../../services/empPortal';
import {
    CheckCircle2, Circle, Clock, Loader2, ListTodo,
    AlertTriangle, Plus, X, Calendar, Flag, Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';

const priorityColors: Record<string, string> = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
};

const EmpTasks: React.FC = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'HIGH',
        due_date: new Date().toISOString().split('T')[0],
        category: 'DOCUMENTATION',
    });

    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['myTasks'],
        queryFn: empGetMyTasks,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            empUpdateTask(id, { status: status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myTasks'] }),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => empCreateTask({
            ...data,
            branch: profile?.branch || '',
            assigned_to: profile?.id,
            status: 'PENDING'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myTasks'] });
            setIsAddModalOpen(false);
            setNewTask({
                title: '',
                description: '',
                priority: 'HIGH',
                due_date: new Date().toISOString().split('T')[0],
                category: 'DOCUMENTATION',
            });
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];
    const pending = tasks?.filter((t: any) => t.status !== 'COMPLETED') || [];
    const completed = tasks?.filter((t: any) => t.status === 'COMPLETED') || [];
    const dueToday = pending.filter((t: any) => t.due_date === today);

    const displayedTasks = filter === 'ALL'
        ? (tasks || [])
        : filter === 'PENDING'
            ? pending
            : completed;

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        createMutation.mutate(newTask);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-500" /> Daily Action Items
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">My Tasks</h1>
                    <p className="text-slate-500 font-medium">Keep track of admissions deadlines, CAS follow-ups, and student calls.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                            <p className="text-xl font-black font-serif text-slate-900">{pending.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                            <p className="text-xl font-black font-serif text-rose-700">{dueToday.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Due Today</p>
                        </div>
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                            <p className="text-xl font-black font-serif text-teal-700">{completed.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-500">Done</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add Task
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                {(['PENDING', 'ALL', 'COMPLETED'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={clsx(
                            "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                            filter === f
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                        )}
                    >
                        {f === 'PENDING' ? `Active (${pending.length})` : f === 'COMPLETED' ? `Completed (${completed.length})` : `All Tasks (${tasks?.length || 0})`}
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            {displayedTasks.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">All Clear!</h3>
                    <p className="text-sm text-slate-500 font-medium">No tasks found in this view.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayedTasks.map((task: any) => {
                        const isDone = task.status === 'COMPLETED';
                        const isDueToday = task.due_date === today;

                        return (
                            <div
                                key={task.id}
                                className={clsx(
                                    "bg-white rounded-[2rem] border p-6 shadow-sm transition-all flex items-start gap-4 group",
                                    isDone
                                        ? "border-slate-100 bg-slate-50/60 opacity-70"
                                        : "border-slate-100 hover:border-teal-200 hover:shadow-md"
                                )}
                            >
                                <button
                                    onClick={() => toggleMutation.mutate({ id: task.id, status: task.status })}
                                    className="mt-1 flex-shrink-0 cursor-pointer"
                                    title={isDone ? "Mark Pending" : "Mark Done"}
                                >
                                    {isDone ? (
                                        <CheckCircle2 className="w-6 h-6 text-teal-600" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                        <h3 className={clsx(
                                            "font-black text-base transition-colors",
                                            isDone ? "line-through text-slate-400" : "text-slate-900"
                                        )}>
                                            {task.title}
                                        </h3>

                                        {task.priority && (
                                            <span className={clsx(
                                                "px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md border",
                                                priorityColors[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200'
                                            )}>
                                                {task.priority}
                                            </span>
                                        )}

                                        {isDueToday && !isDone && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                                <Clock className="w-3 h-3" /> Today
                                            </span>
                                        )}
                                    </div>

                                    {task.description && (
                                        <p className={clsx(
                                            "text-sm font-medium mb-2.5",
                                            isDone ? "text-slate-400" : "text-slate-600"
                                        )}>
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold flex-wrap">
                                        {task.due_date && (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                Due {format(parseISO(task.due_date), 'MMM dd, yyyy')}
                                            </span>
                                        )}
                                        {task.category && (
                                            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {task.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Task Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <h2 className="text-2xl font-black text-slate-900 font-serif">Create Counselor Task</h2>
                            <p className="text-sm text-slate-500 font-medium">Add a follow-up action, document verification reminder, or lead call.</p>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Call Alexander Chen regarding IB transcript"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-teal-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Detailed notes for this action item..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Saving...' : 'Save Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpTasks;
