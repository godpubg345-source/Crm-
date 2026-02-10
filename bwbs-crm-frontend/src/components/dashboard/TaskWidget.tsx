import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { RecentTask } from '../../services/dashboard';

interface TaskWidgetProps {
    tasks: RecentTask[];
}

export const TaskWidget = ({ tasks }: TaskWidgetProps) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-[#AD03DE] to-blue-500" />

            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-serif font-black text-slate-900">My Priorities</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Actions & Deadlines</p>
                </div>
                <Link to="/tasks" className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#AD03DE] hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <CheckCircle2 className="w-12 h-12 text-emerald-200 mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All caught up!</p>
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
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/item:text-[#AD03DE] transition-colors">
                                    {task.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {task.student_name && (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {task.student_name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{tasks.length} Pending</span>
                <span className="text-[#AD03DE]">{tasks.filter(t => t.priority === 'URGENT').length} Urgent</span>
            </div>
        </div>
    );
};
