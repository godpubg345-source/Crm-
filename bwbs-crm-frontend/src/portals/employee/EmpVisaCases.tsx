import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { empGetMyVisaCases } from '../../services/empPortal';
import { Stamp, Loader2, Calendar, User, MapPin } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
    EXPIRED: 'bg-slate-200 text-slate-600',
};

const EmpVisaCases: React.FC = () => {
    const { data: visas, isLoading } = useQuery({
        queryKey: ['myVisaCases'],
        queryFn: empGetMyVisaCases,
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
                <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">My Visa Cases</h1>
                <p className="text-slate-500 font-medium">Visa applications you're handling for students.</p>
            </div>

            {visas?.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <Stamp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">No Visa Cases</h3>
                    <p className="text-sm text-slate-500 font-medium">Visa cases will appear here when assigned to you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visas?.map((visa: any) => (
                        <div key={visa.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-teal-100 transition-all">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Stamp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900">{visa.visa_type_display || visa.visa_type || 'Visa'}</h3>
                                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {visa.destination_country || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <span className={clsx(
                                    "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                                    statusColors[visa.status] || 'bg-slate-100 text-slate-600'
                                )}>
                                    {visa.status_display || visa.status}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {visa.student_name || 'Unknown Student'}
                                </div>
                                {visa.submission_date && (
                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Submitted: {visa.submission_date}
                                    </div>
                                )}
                            </div>

                            {visa.remarks && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 font-medium line-clamp-2">{visa.remarks}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmpVisaCases;
