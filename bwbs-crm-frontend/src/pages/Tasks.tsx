import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, deleteTask, type Task, priorityColors } from '../services/tasks';
import { TaskModal } from '../components/tasks/TaskModal';
import {
    CheckCircle2,
    Calendar,
    Plus,
    Search,
    Filter,
    User as UserIcon,
    Trash2,
    Edit3,
    Loader2,
    Target,
    FileText,
    Banknote,
    GraduationCap,
    Globe,
    PlaneLanding,
    Layers
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// TASK CENTER - PRODUCTIVITY COMMAND HUB
// ============================================================================

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
};

const statusConfig: Record<string, { bg: string, text: string, border: string, dot: string }> = {
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-400' },
    IN_PROGRESS: { bg: 'bg-[#AD03DE]/5', text: 'text-[#AD03DE]', border: 'border-[#AD03DE]/10', dot: 'bg-[#AD03DE]' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-400' },
    CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-100', dot: 'bg-slate-300' },
};

const categoryConfig: Record<string, { icon: any, color: string }> = {
    DOCUMENTATION: { icon: FileText, color: 'text-blue-500' },
    FINANCE: { icon: Banknote, color: 'text-emerald-500' },
    ADMISSION: { icon: GraduationCap, color: 'text-[#AD03DE]' },
    VISA_PREP: { icon: Globe, color: 'text-amber-500' },
    POST_ARRIVAL: { icon: PlaneLanding, color: 'text-indigo-500' },
    OTHER: { icon: Layers, color: 'text-slate-400' },
};

const TaskDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

    const queryClient = useQueryClient();

    const { data: tasksResponse, isLoading } = useQuery({
        queryKey: ['tasks', filterStatus],
        queryFn: () => getTasks({ status: filterStatus || undefined })
    });

    const tasks = tasksResponse?.results || [];

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
    });

    const handleAdd = () => {
        setSelectedTask(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Commence task decommissioning?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading && !tasksResponse) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Synchronizing Productivity Nodes</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-[#6a0288] rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-extrabold text-slate-900 tracking-tight leading-none">Productivity Center</h1>
                    </div>
                    <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.5em] ml-6">Objective management • Strategic activity tracking</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE]" />
                        <input
                            type="text"
                            placeholder="Search Objectives..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-extrabold text-slate-800 placeholder:text-slate-300 w-48 uppercase tracking-widest"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-2xl">
                        <Filter className="w-4 h-4 text-slate-300" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-extrabold text-slate-900 focus:ring-0 cursor-pointer uppercase tracking-widest"
                        >
                            <option value="">Global Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="w-px h-10 bg-slate-100 mx-1" />

                    <button
                        onClick={handleAdd}
                        className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-extrabold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-500" />
                        Initiate Objective
                    </button>
                </div>
            </div>

            {/* Task Stream */}
            <div className="space-y-8">
                {filteredTasks.map((task) => {
                    const config = statusConfig[task.status] || statusConfig.PENDING;
                    const catConfig = categoryConfig[task.category] || categoryConfig.OTHER;
                    const CatIcon = catConfig.icon;
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                        <div
                            key={task.id}
                            className="group bg-white p-10 rounded-[3rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10"
                        >
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/5 transition-colors duration-1000" />

                            <div className="flex items-start gap-8 flex-1">
                                <button className={clsx(
                                    "w-16 h-16 rounded-[1.75rem] flex items-center justify-center border transition-all duration-700 shadow-sm group-hover:shadow-lg",
                                    isCompleted ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-slate-50 text-slate-300 border-slate-100"
                                )}>
                                    <CheckCircle2 className={clsx("w-8 h-8", isCompleted && "animate-in zoom-in-50 duration-500")} />
                                </button>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "px-3 py-1.5 rounded-xl border flex items-center gap-2 shadow-sm transition-all duration-500 group-hover:border-[#AD03DE]/30",
                                            isCompleted ? "bg-slate-50 border-slate-100" : "bg-white border-slate-100"
                                        )}>
                                            <CatIcon className={clsx("w-3.5 h-3.5 transition-colors duration-500", isCompleted ? "text-slate-300" : catConfig.color)} />
                                            <span className={clsx("text-[9px] font-extrabold uppercase tracking-widest", isCompleted ? "text-slate-300" : "text-slate-600")}>
                                                {task.category?.replace('_', ' ') || 'Process'}
                                            </span>
                                        </div>
                                        <h3 className={clsx(
                                            "text-3xl font-serif font-extrabold transition-all duration-700",
                                            isCompleted ? "text-slate-300 line-through" : "text-slate-900 group-hover:text-[#AD03DE]"
                                        )}>
                                            {task.title}
                                        </h3>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg text-[8px] font-extrabold uppercase tracking-[0.2em] border shadow-sm",
                                            priorityColors[task.priority as keyof typeof priorityColors] || "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {task.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">{task.description}</p>

                                    <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-rose-500 border border-slate-100">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <span>Deadline: {formatDate(task.due_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <span>Custodian: {task.assigned_to.first_name} {task.assigned_to.last_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pl-10 border-l border-slate-50 lg:pl-0 lg:border-l-0 lg:border-t-0 border-t pt-10 lg:pt-0">
                                <span className={clsx(
                                    "px-5 py-2.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border transition-all duration-700",
                                    config.bg, config.text, config.border,
                                    "group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 shadow-sm"
                                )}>
                                    <div className={clsx("w-1.5 h-1.5 rounded-full inline-block mr-2", config.dot, "group-hover:bg-emerald-400 group-hover:animate-pulse")} />
                                    {task.status.replace('_', ' ')}
                                </span>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-[#AD03DE] hover:border-[#AD03DE]/30 transition-all active:scale-90 shadow-sm"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-90 shadow-sm"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredTasks.length === 0 && (
                    <div className="p-24 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-inner mb-8 group">
                            <Target className="w-12 h-12 text-slate-100 group-hover:rotate-12 transition-transform duration-700" strokeWidth={1} />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Zero Objectives Detected</h4>
                        <p className="text-[11px] font-serif font-bold text-slate-300 mt-2">The productivity stream is currently dormant in this domain.</p>
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />
        </div>
    );
};

export default TaskDashboard;
