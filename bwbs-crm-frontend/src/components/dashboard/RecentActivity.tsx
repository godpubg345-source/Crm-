import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../services/auditLogs';
import { FileText, UserPlus, Trash2, Edit, Clock } from 'lucide-react';
import clsx from 'clsx';

export const RecentActivity = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: () => getAuditLogs({ page: 1, ordering: '-created_at' }),
    });

    const getIcon = (action: string, model: string) => {
        if (action === 'DELETE') return Trash2;
        if (model === 'documents.Document') return FileText;
        if (model === 'students.Student') return UserPlus;
        return Edit;
    };



    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-card rounded-lg" />)}
        </div>;
    }

    const logs = data?.results.slice(0, 5) || [];

    return (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
            <div className="p-6 border-b border-border flex items-center justify-between bg-white">
                <h3 className="font-serif text-xl font-extrabold text-slate-900">Global Stream</h3>
                <button className="text-[10px] font-bold uppercase tracking-widest text-[#AD03DE] hover:text-[#9302bb] bg-[#AD03DE]/5 px-3 py-1.5 rounded-lg transition-colors">Live Activity</button>
            </div>
            <div className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Clock className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No recent pulses</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const Icon = getIcon(log.action, log.model);
                        return (
                            <div key={log.id} className="p-5 hover:bg-slate-50/80 transition-all flex items-center gap-4 group cursor-default">
                                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm border",
                                    log.action === 'DELETE' ? 'bg-red-50 text-red-600 border-red-100' :
                                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-900 font-bold font-serif truncate">
                                        <span className="text-indigo-600 font-extrabold">
                                            {log.actor_details?.first_name || 'System'}
                                        </span>
                                        {' '}
                                        <span className="text-slate-600 font-sans font-extrabold text-[11px] uppercase tracking-tighter mx-1">has {log.action.toLowerCase()}d</span>
                                        {' '}
                                        <span className="text-slate-700">{log.object_repr || 'item'}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                            {new Date(log.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <button className="text-[10px] font-bold uppercase tracking-widest text-[#AD03DE] hover:underline">Syncing system logs...</button>
            </div>
        </div>
    );
};
