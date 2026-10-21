import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { empGetMyApplications } from '../../services/empPortal';
import { FileStack, Loader2, ArrowRight, Building2, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border border-slate-200',
    DOCUMENTS_READY: 'bg-amber-100 text-amber-800 border border-amber-200',
    SUBMITTED: 'bg-blue-100 text-blue-800 border border-blue-200',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800 border border-purple-200',
    CONDITIONAL_OFFER: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    UNCONDITIONAL_OFFER: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    CAS_RECEIVED: 'bg-teal-100 text-teal-800 border border-teal-200',
    ENROLLED: 'bg-green-100 text-green-800 border border-green-200',
    REJECTED: 'bg-rose-100 text-rose-800 border border-rose-200',
};

const EmpApplications: React.FC = () => {
    const { data: apps, isLoading } = useQuery({
        queryKey: ['myApplications'],
        queryFn: empGetMyApplications,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    const totalApps = apps?.length || 0;
    const offersCount = apps?.filter((a: any) => ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED'].includes(a.status)).length || 0;
    const reviewCount = apps?.filter((a: any) => ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_READY'].includes(a.status)).length || 0;
    const enrolledCount = apps?.filter((a: any) => ['CAS_RECEIVED', 'ENROLLED'].includes(a.status)).length || 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">My Applications</h1>
                <p className="text-slate-500 font-medium">Track student applications you're managing.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Active</p>
                    <p className="text-2xl font-black font-serif text-slate-900">{totalApps}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Offers Secured</p>
                    <p className="text-2xl font-black font-serif text-emerald-600">{offersCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Under Review</p>
                    <p className="text-2xl font-black font-serif text-blue-600">{reviewCount}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">CAS & Enrolled</p>
                    <p className="text-2xl font-black font-serif text-teal-600">{enrolledCount}</p>
                </div>
            </div>

            {apps?.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <FileStack className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">No Applications Yet</h3>
                    <p className="text-sm text-slate-500 font-medium">Applications you create or manage will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">University</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Programme</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Intake</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {apps?.map((app: any) => (
                                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                                    <GraduationCap className="w-4 h-4" />
                                                </div>
                                                {app.student_name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                {app.university_name_display || app.university_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-600 font-medium max-w-[200px] truncate">
                                            {app.course_name_display || app.programme_name || app.course_name || 'N/A'}
                                        </td>
                                        <td className="p-5">
                                            <span className={clsx(
                                                "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                                                statusColors[app.status] || 'bg-slate-100 text-slate-600'
                                            )}>
                                                {app.status_display || app.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-5 font-bold text-slate-900">{app.intake_date || app.intake || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpApplications;
