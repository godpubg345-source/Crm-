import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { VisaAlert } from '../../services/dashboard';
import { Link } from 'react-router-dom';

interface VisaAlertsWidgetProps {
    alerts: VisaAlert[];
}

export const VisaAlertsWidget = ({ alerts }: VisaAlertsWidgetProps) => {
    return (
        <div className="bg-rose-50 rounded-[2rem] border border-rose-100 p-6 flex flex-col h-full relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-200/30 blur-3xl rounded-full" />

            <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white text-rose-500 rounded-xl shadow-lg shadow-rose-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-serif font-black text-rose-900">Critical Visas</h3>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Action Required</p>
                </div>
            </div>

            <div className="flex-1 space-y-3 relative z-10">
                {alerts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-rose-300 text-xs font-bold uppercase tracking-widest">
                        No critical cases
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 group/card hover:scale-105 transition-transform">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{alert.student_name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{alert.country} • {alert.days_pending} days pending</p>
                                </div>
                                <Link to={`/visas/${alert.id}`} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="mt-2 w-full bg-rose-50 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full animate-pulse" style={{ width: '80%' }} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Link to="/visas" className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:underline">
                View Policy Violations
            </Link>
        </div>
    );
};
