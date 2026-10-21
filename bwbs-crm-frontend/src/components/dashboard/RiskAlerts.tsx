import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface DocumentAlert {
    id: string;
    student_name: string;
    document_type: string;
    expiry_date: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    severity_display: string;
}

export const RiskAlerts = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<{ results: DocumentAlert[] }>({
        queryKey: ['documentAlerts'],
        queryFn: async () => {
            const response = await api.get('/document-alerts/');
            return response.data;
        }
    });

    const acknowledgeMutation = useMutation({
        mutationFn: (id: string) => api.post(`/document-alerts/${id}/acknowledge/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documentAlerts'] });
        }
    });

    const alerts = data?.results || [];

    if (isLoading) return <div className="h-48 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />;

    if (alerts.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center group hover:border-emerald-100 transition-colors">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center mb-6 shadow-sm transition-transform">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">All documents OK</h4>
                <p className="text-xs text-slate-500 mt-2">No document issues</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-border flex flex-col h-full relative overflow-hidden group">

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Document alerts</h3>
                    <p className="text-xs text-slate-500 mt-1">Expiring or missing documents</p>
                </div>
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar relative z-10">
                {alerts.map((alert: DocumentAlert) => (
                    <motion.div
                        key={alert.id}
                        initial={alert.severity === 'CRITICAL' ? { scale: 1 } : false}
                        animate={alert.severity === 'CRITICAL' ? {
                            scale: [1, 1.02, 1],
                            borderColor: ['rgba(251, 113, 133, 0.2)', 'rgba(251, 113, 133, 0.5)', 'rgba(251, 113, 133, 0.2)']
                        } : {}}
                        transition={alert.severity === 'CRITICAL' ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : {}}
                        className={`p-5 rounded-2xl border flex items-start gap-4 group/item transition-all hover:shadow-md ${alert.severity === 'CRITICAL' ? 'bg-rose-50/40 border-rose-200 ' :
                            alert.severity === 'WARNING' ? 'bg-amber-50/30 border-amber-100' :
                                'bg-blue-50/30 border-blue-100'
                            }`}
                    >
                        <div className={`mt-0.5 p-2 rounded-lg bg-white shadow-sm ${alert.severity === 'CRITICAL' ? 'text-rose-500 relative' :
                            alert.severity === 'WARNING' ? 'text-amber-500' :
                                'text-blue-500'
                            }`}>
                            {alert.severity === 'CRITICAL' && (
                                <span className="absolute inset-0 rounded-lg bg-rose-500/20 animate-ping" />
                            )}
                            {alert.severity === 'CRITICAL' ? <AlertCircle className="w-4 h-4 relative z-10" /> : <Info className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{alert.student_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">{alert.document_type}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className={`text-xs font-bold ${alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
                                    }`}>
                                    Expires {new Date(alert.expiry_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-white rounded-xl transition-all text-slate-300 hover:text-emerald-500 shadow-sm border border-transparent hover:border-emerald-100"
                            title="Dismiss"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Total Risks: {alerts.length}</span>
                <span className="text-rose-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Checked automatically
                </span>
            </div>
        </div>
    );
};
