import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    empGetMyProfile,
    empGetMyTasks,
    empGetMyApplications,
    empGetMyStudents,
    empGetAttendanceLogs
} from '../../services/empPortal';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    PhoneCall,
    FileSearch,
    BadgeDollarSign,
    User,
    ArrowRight,
    GraduationCap,
    FileText,
    CalendarCheck,
    Sparkles,
    AlertCircle,
    Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';

const EmpDashboard: React.FC = () => {
    // 1. Profile Data
    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    // 2. Tasks
    const { data: tasks, isLoading: isLoadingTasks } = useQuery({
        queryKey: ['myTasks'],
        queryFn: empGetMyTasks,
    });

    // 3. Applications
    const { data: applications, isLoading: isLoadingApps } = useQuery({
        queryKey: ['myApplications'],
        queryFn: empGetMyApplications,
    });

    // 4. Students
    const { data: students, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['myStudents'],
        queryFn: empGetMyStudents,
    });

    // 5. Attendance
    const { data: attendanceLogs } = useQuery({
        queryKey: ['myAttendance', profile?.id],
        queryFn: () => empGetAttendanceLogs(undefined, profile?.id),
        enabled: !!profile?.id,
    });

    if (isLoadingProfile || isLoadingTasks || isLoadingApps || isLoadingStudents) {
        return (
            <div className="animate-pulse space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
                <div className="h-56 bg-slate-200/80 rounded-[2.5rem]" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-slate-200/80 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="h-96 bg-slate-200/80 rounded-[2.5rem]" />
                    <div className="h-96 bg-slate-200/80 rounded-[2.5rem]" />
                    <div className="h-96 bg-slate-200/80 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    // Filter Logic for Action Items
    const today = new Date().toISOString().split('T')[0];
    const pendingTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status !== 'COMPLETED') : [];

    const appsList = Array.isArray(applications) ? applications : (applications as any)?.results || [];

    // Offers pending deposit (CONDITIONAL_OFFER or UNCONDITIONAL_OFFER)
    const feeCollectionApps = appsList.filter((app: any) =>
        app.status === 'CONDITIONAL_OFFER' || app.status === 'UNCONDITIONAL_OFFER' || app.status === 'CAS_RECEIVED'
    );

    // Students with recent uploaded documents requiring review
    const docsToVerifyApps = appsList.filter((app: any) =>
        app.status === 'DOCUMENTS_READY' || app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW'
    );

    const logsList = Array.isArray(attendanceLogs) ? attendanceLogs : (attendanceLogs as any)?.results || [];
    const todayLog = logsList.find((log: any) => log.date === today);
    const isClockedIn = !!todayLog?.clock_in && !todayLog?.clock_out;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const totalActionsCount = pendingTasks.length + feeCollectionApps.length + docsToVerifyApps.length;

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto pb-16">
            {/* Command Center Hero Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#091524] via-[#0E243A] to-[#081220] rounded-[2.5rem] p-8 md:p-10 border border-teal-500/30 shadow-xl shadow-slate-950/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white"
            >
                {/* Decorative Glowing Flares */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center text-3xl font-serif font-black shadow-lg shadow-teal-500/20 ring-4 ring-white/10 shrink-0">
                        {profile?.first_name?.charAt(0) || <User />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-400/15 text-teal-300 border border-teal-400/30">
                                Senior Education Counselor
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" /> London Central Branch
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-serif mb-1">
                            {greeting()}, {profile?.first_name} {profile?.last_name}
                        </h1>
                        <p className="text-teal-300 font-medium text-sm">
                            Counselor Operations Command Center — {format(new Date(), 'EEEE, MMMM do')}.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 text-left md:text-right shadow-inner">
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-1">Actions Pending</p>
                        <h2 className="text-4xl font-black font-serif text-white tracking-tight">
                            {totalActionsCount}
                        </h2>
                    </div>
                </div>
            </motion.div>

            {/* 4-Stat Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    to="/employee-portal/students"
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-teal-500/60 hover:-translate-y-1 transition-all flex items-center gap-4 group"
                >
                    <div className="p-3.5 bg-gradient-to-br from-teal-50 to-teal-100/80 text-teal-600 rounded-xl group-hover:from-teal-600 group-hover:to-teal-700 group-hover:text-white transition-all shrink-0 shadow-xs">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black font-serif text-slate-900">{students?.length || 0}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Students</p>
                    </div>
                </Link>

                <Link
                    to="/employee-portal/applications"
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-500/60 hover:-translate-y-1 transition-all flex items-center gap-4 group"
                >
                    <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100/80 text-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all shrink-0 shadow-xs">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black font-serif text-slate-900">{appsList.length}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Applications</p>
                    </div>
                </Link>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-amber-100/80 text-amber-600 rounded-xl shrink-0 shadow-xs">
                        <BadgeDollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black font-serif text-slate-900">{feeCollectionApps.length}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Offers Awaiting Deposit</p>
                    </div>
                </div>

                <Link
                    to="/employee-portal/attendance"
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-500/60 hover:-translate-y-1 transition-all flex items-center gap-4 group"
                >
                    <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-600 rounded-xl group-hover:from-emerald-600 group-hover:to-emerald-700 group-hover:text-white transition-all shrink-0 shadow-xs">
                        <CalendarCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-700">
                            {isClockedIn ? 'Active Shift' : 'Clocked In'}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {todayLog?.clock_in ? `${format(new Date(todayLog.clock_in), 'HH:mm')} • 4.5h Logged` : 'Today'}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Three Pillar Action Boards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Today's Priority Calls & Tasks */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[600px]"
                >
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
                                <PhoneCall className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base">Priority Counselor Tasks</h3>
                                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Action Items</p>
                            </div>
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-xs">
                            {pendingTasks.length}
                        </span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto bg-slate-50/60 space-y-3">
                        {pendingTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 my-auto">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                                <p className="text-slate-600 font-bold text-sm">All caught up on tasks!</p>
                            </div>
                        ) : (
                            pendingTasks.map((task: any) => (
                                <Link
                                    key={task.id}
                                    to={`/employee-portal/tasks`}
                                    className="block p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors leading-snug">
                                            {task.title}
                                        </h4>
                                        {task.due_date === today && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 shrink-0">
                                                <Clock className="w-3 h-3" /> Due Today
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                                        <span className={clsx(
                                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border",
                                            task.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                task.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                        )}>
                                            {task.priority || 'HIGH'}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 flex items-center gap-1 transition-all">
                                            Manage Task <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3.5 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs shrink-0">
                        <span className="text-slate-500 font-medium">{pendingTasks.length} queued tasks</span>
                        <Link to="/employee-portal/tasks" className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                            Open Task Board <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* 2. Document Verification Queue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white rounded-[2rem] border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[600px]"
                >
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
                                <FileSearch className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base">Document Verification</h3>
                                <p className="text-[10px] text-amber-100 uppercase tracking-widest font-bold">University Applications</p>
                            </div>
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-xs">
                            {docsToVerifyApps.length}
                        </span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto bg-slate-50/60 space-y-3">
                        {docsToVerifyApps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 my-auto">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                                <p className="text-slate-600 font-bold text-sm">No applications pending review.</p>
                            </div>
                        ) : (
                            docsToVerifyApps.map((app: any) => {
                                const universityName = app.university_name_display || app.university_name || `Application #${app.id}`;
                                const studentId = app.student || app.student_id;

                                return (
                                    <Link
                                        key={app.id}
                                        to={studentId ? `/employee-portal/students/${studentId}` : `/employee-portal/applications`}
                                        className="block p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                                                {universityName}
                                            </h4>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                                {app.status_display || app.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                            {app.course_name_display || app.course_name || 'Academic Degree Program'}
                                        </p>
                                        {app.student_name && (
                                            <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                Student: {app.student_name}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                                            <span className="text-xs font-bold text-amber-600 group-hover:translate-x-1 flex items-center gap-1 transition-all">
                                                Review Dossier <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3.5 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs shrink-0">
                        <span className="text-slate-500 font-medium">{docsToVerifyApps.length} pending dossiers</span>
                        <Link to="/employee-portal/applications" className="font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors">
                            All Applications <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

                {/* 3. Offers & Deposit Tracking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-[2rem] border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[600px]"
                >
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
                                <BadgeDollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base">Offers & Deposit Tracking</h3>
                                <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">CAS Clearance</p>
                            </div>
                        </div>
                        <span className="bg-white/20 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-xs">
                            {feeCollectionApps.length}
                        </span>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto bg-slate-50/60 space-y-3">
                        {feeCollectionApps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 my-auto">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                                <p className="text-slate-600 font-bold text-sm">No pending offers.</p>
                            </div>
                        ) : (
                            feeCollectionApps.map((app: any) => {
                                const universityName = app.university_name_display || app.university_name || `Application #${app.id}`;
                                const studentId = app.student || app.student_id;

                                return (
                                    <Link
                                        key={app.id}
                                        to={studentId ? `/employee-portal/students/${studentId}` : `/employee-portal/applications`}
                                        className="block p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                                                {universityName}
                                            </h4>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                                {app.status === 'UNCONDITIONAL_OFFER' ? 'Unconditional' :
                                                    app.status === 'CONDITIONAL_OFFER' ? 'Conditional' : 'CAS Ready'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                            {app.course_name_display || app.course_name || 'Academic Degree Program'}
                                        </p>
                                        {app.student_name && (
                                            <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                Student: {app.student_name}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                                            <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 flex items-center gap-1 transition-all">
                                                Collect Deposit & Issue CAS <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3.5 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs shrink-0">
                        <span className="text-slate-500 font-medium">{feeCollectionApps.length} active offers</span>
                        <Link to="/employee-portal/applications" className="font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors">
                            Track Deposits <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default EmpDashboard;
