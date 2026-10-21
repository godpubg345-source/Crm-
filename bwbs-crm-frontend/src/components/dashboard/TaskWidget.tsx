import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { RecentTask } from '../../services/dashboard';

interface TaskWidgetProps {
    tasks: RecentTask[];
}

export const TaskWidget = ({ tasks }: TaskWidgetProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full relative overflow-hidden group transition-all duration-200">

            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">My tasks</h3>
                    <p className="text-xs text-slate-500 mt-1">Due soon</p>
                </div>
                <Link to="/admin/dashboard/tasks" className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#7c3aed] hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                        <CheckCircle2 className="w-12 h-12 text-emerald-200 mb-4" />
                        <p className="text-xs text-slate-500">All caught up!</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="group/item p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-start gap-3 cursor-pointer">
                            <div className={clsx(
                                "mt-1 w-2 h-2 rounded-full",
                                task.priority === 'URGENT' ? "bg-rose-500 animate-pulse" :
                                    task.priority === 'HIGH' ? "bg-amber-500" :
                                        "bg-emerald-500"
                            )} />

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/item:text-[#7c3aed] transition-colors">
                                    {task.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {task.student_name && (
                                        <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {task.student_name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <button className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all" title="Mark Complete">
                                <CheckCircle2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{tasks.length} Pending</span>
                <span className="text-[#7c3aed]">{tasks.filter(t => t.priority === 'URGENT').length} Urgent</span>
            </div>
        </div>
    );
};
