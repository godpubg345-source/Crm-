import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { FileText, ChevronRight, Clock } from 'lucide-react';
import {
    getApplications,
    statusLabels,
    statusColors,
    type Application
} from '../../services/applications';

type DashboardApplication = Omit<Application, 'status'> & {
    status: string;
    student_name?: string;
    student_code?: string;
    university_name_display?: string;
    course_name_display?: string;
    intake_date?: string;
    status_display?: string;
};

const getStatusLabel = (application: DashboardApplication) => {
    const known = statusLabels[application.status as keyof typeof statusLabels];
    if (known) return known;
    if (application.status_display) return application.status_display;
    return application.status.replace(/_/g, ' ');
};

const getStatusColor = (application: DashboardApplication) => (
    statusColors[application.status as keyof typeof statusColors]
    || 'bg-slate-50 text-slate-400 border-slate-100'
);

const getStudentName = (application: DashboardApplication) => (
    application.student?.name
    || application.student_name
    || 'Unknown Scholar'
);

const getStudentCode = (application: DashboardApplication) => (
    application.student?.student_code
    || application.student_code
    || application.id.slice(0, 6).toUpperCase()
);

const getUniversityName = (application: DashboardApplication) => (
    application.university?.name
    || application.university_name_display
    || 'Unknown University'
);

const getCourseName = (application: DashboardApplication) => (
    application.course?.name
    || application.course_name_display
    || 'Program'
);

const getIntake = (application: DashboardApplication) => (
    application.intake
    || application.intake_date
    || 'Intake TBD'
);

export const RecentApplications = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboardApplications'],
        queryFn: () => getApplications({ page: 1 }),
    });

    const applications = (data?.results || []) as DashboardApplication[];
    const displayApps = applications.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
            <div className="p-6 border-b border-border bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#AD03DE]/10 text-[#AD03DE] flex items-center justify-center shadow-inner">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl font-extrabold text-slate-900">Application Module</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Latest submissions and status intelligence
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                            <p className="text-lg font-black text-slate-900">{data?.count ?? 0}</p>
                        </div>
                        <Link
                            to="/applications"
                            className="text-[10px] font-bold uppercase tracking-widest text-[#AD03DE] hover:text-[#9302bb] bg-[#AD03DE]/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                            Open Module <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-slate-50">
                {isLoading ? (
                    <div className="p-6 space-y-4 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 bg-slate-50 rounded-xl" />
                        ))}
                    </div>
                ) : displayApps.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Clock className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No applications found</p>
                    </div>
                ) : (
                    displayApps.map((application) => (
                        <div
                            key={application.id}
                            className="p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center gap-4"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 font-serif font-extrabold shadow-sm">
                                    {getStudentName(application).charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm text-slate-900 font-bold font-serif truncate">
                                            {getStudentName(application)}
                                        </p>
                                        <span className={clsx(
                                            "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                            getStatusColor(application)
                                        )}>
                                            {getStatusLabel(application)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                        {getUniversityName(application)} - {getCourseName(application)}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                                        {getStudentCode(application)}
                                    </p>
                                </div>
                            </div>
                            <div className="md:text-right">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Intake</p>
                                <p className="text-sm font-black text-slate-900">{getIntake(application)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                <Link
                    to="/applications"
                    className="text-[10px] font-bold uppercase tracking-widest text-[#AD03DE] hover:underline"
                >
                    View All Applications
                </Link>
            </div>
        </div>
    );
};
