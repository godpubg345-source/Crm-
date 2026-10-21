import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { empGetMessages } from '../../services/empPortal';
import { MessageCircle, Loader2, Clock, User } from 'lucide-react';

const EmpMessages: React.FC = () => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['myMessages'],
        queryFn: empGetMessages,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Messages</h1>
                <p className="text-slate-500 font-medium">Message history and delivery logs.</p>
            </div>

            {logs?.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">No Messages Yet</h3>
                    <p className="text-sm text-slate-500 font-medium">Your message history will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {logs?.map((log: any) => (
                        <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-black text-slate-900 truncate">{log.subject || 'No Subject'}</h3>
                                        {log.created_at && (
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium truncate">
                                        {log.body || log.recipient || '—'}
                                    </p>
                                    {log.status && (
                                        <span className="inline-block mt-2 bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                            {log.status_display || log.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmpMessages;
