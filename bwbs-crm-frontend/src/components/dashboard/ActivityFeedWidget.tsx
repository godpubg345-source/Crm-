import { FileText, UserPlus, Trash2, Edit, Clock, Activity } from 'lucide-react';
import clsx from 'clsx';
import type { RecentActivity } from '../../services/dashboard';

interface ActivityFeedWidgetProps {
    activities: RecentActivity[];
}

export const ActivityFeedWidget = ({ activities }: ActivityFeedWidgetProps) => {
    const getIcon = (action: string, model: string) => {
        if (action === 'DELETE') return Trash2;
        if (model.includes('Document')) return FileText;
        if (model.includes('Student')) return UserPlus;
        return Edit;
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 flex flex-col h-full">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-[2rem]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-black text-slate-900 leading-none">Live Stream</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">System Intelligence</p>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {activities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <Clock className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No recent pulses</p>
                    </div>
                ) : (
                    activities.map((log) => {
                        const Icon = getIcon(log.action, log.model);
                        return (
                            <div key={log.id} className="p-4 hover:bg-slate-50 rounded-2xl transition-all flex items-start gap-4 group cursor-default border border-transparent hover:border-slate-100">
                                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm border shrink-0",
                                    log.action === 'DELETE' ? 'bg-red-50 text-red-600 border-red-100' :
                                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-600 font-bold font-serif leading-relaxed">
                                        <span className="text-indigo-600 font-extrabold text-sm block mb-0.5">
                                            {log.actor || 'System'}
                                        </span>
                                        {log.description}
                                    </p>
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
