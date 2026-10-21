import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortalMe, isPortalAuthenticated } from '../../services/portal';
import { isAuthenticated as isAdminAuthenticated } from '../../services/auth';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Clock,
    ArrowUpRight,
    FileText,
    Calendar,
    ChevronRight,
    User,
    Zap,
    Target,
    ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { PortalApplication, PortalNotification } from '../../services/portal';

const JOURNEY_STEPS = [
    { id: 'onboarding', label: 'Onboarding', description: 'Portal Access & Profile Setup' },
    { id: 'application', label: 'Application', description: 'University Submission' },
    { id: 'interview', label: 'Interview', description: 'Academic Assessment' },
    { id: 'offer', label: 'Offer', description: 'Letter of Acceptance' },
    { id: 'visa', label: 'Visa', description: 'Final Documentation' },
];

const PortalDashboard: React.FC = () => {
    const isAdminPreview = isAdminAuthenticated() && !isPortalAuthenticated();

    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
        enabled: isPortalAuthenticated(), // Only fetch if student token exists
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-48 bg-white rounded-[2.5rem]" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-white rounded-[2.5rem]" />
                        <div className="h-96 bg-white rounded-[2.5rem]" />
                    </div>
                    <div className="h-full bg-white rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    // Admin preview mode — show demo layout
    const student = data?.student ?? { full_name: 'Preview Student', student_code: 'STU-DEMO', status: 'Active', counselor_details: null };
    const applications = data?.applications ?? [];
    const notifications = data?.notifications ?? [];
    const documents = data?.documents ?? [];

    // Calculate current progress based on application status
    const currentStepIndex = applications.some((app: PortalApplication) => app.status === 'offer_received') ? 3 :
        applications.some((app: PortalApplication) => app.status === 'submitted') ? 1 : 0;

    // Filter actions for the sidebar
    const activeActions = notifications.filter((n: PortalNotification) => n.category === 'ACTION' && !n.read_at).slice(0, 3);

    // Calculate Profile Completeness (mock logic based on document types)
    const requiredTypes = ['PASSPORT', 'TRANSCRIPT', 'CV', 'IELTS'];
    const uploadedTypes = new Set(documents.map((d: any) => d.document_type));
    const missingDocs = requiredTypes.filter(type => !uploadedTypes.has(type));
    const profileCompleteness = Math.round(((requiredTypes.length - missingDocs.length) / requiredTypes.length) * 100);

    // Success Probability (mock AI logic)
    const successProbability = applications.length > 0 ? (profileCompleteness > 80 ? 92 : 65) : 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Admin preview notice */}
            {isAdminPreview && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
                    <span className="text-sm font-black">👁 Admin Preview Mode</span>
                    <span className="text-xs font-medium">You are viewing the Student Portal as an administrator. Student data requires an active invite token.</span>
                </div>
            )}
            {/* Visual Journey Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)] relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                                    Active Journey
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    ID: {student.student_code}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif">
                                Hello, {student.full_name.split(' ')[0]}!
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Here's your current path to global education.</p>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-100 hidden md:block" />
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                            {JOURNEY_STEPS.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
                                const isActive = index === currentStepIndex;
                                return (
                                    <div key={step.id} className="relative flex flex-col items-center text-center">
                                        <div className={clsx(
                                            "w-11 h-11 rounded-full flex items-center justify-center relative z-10 mb-4 transition-all duration-500",
                                            isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" :
                                                isActive ? "bg-purple-600 text-white shadow-xl shadow-purple-200 scale-110" :
                                                    "bg-white border-2 border-slate-100 text-slate-300"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isActive ? <Clock className="w-6 h-6 animate-pulse" /> : <Circle className="w-6 h-6" />}
                                        </div>
                                        <span className={clsx(
                                            "text-xs font-black uppercase tracking-widest mb-1",
                                            isActive ? "text-purple-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                                        )}>
                                            {step.label}
                                        </span>
                                        <p className="text-[10px] text-slate-400 font-bold px-4 leading-tight">{step.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Intelligence Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Profile Intelligence */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    Profile Intelligence
                                </h3>
                                <span className="text-2xl font-black text-indigo-600">{profileCompleteness}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full mb-6 relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${profileCompleteness}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full"
                                />
                            </div>
                            <div className="space-y-3">
                                {missingDocs.length > 0 ? (
                                    <>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attention Required</p>
                                        {missingDocs.map(doc => (
                                            <div key={doc} className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Missing {doc.charAt(0) + doc.slice(1).toLowerCase()}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Profile fully optimized
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Success Probability */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black flex items-center gap-2 text-indigo-300">
                                    <Zap className="w-5 h-5" />
                                    Admission Success
                                </h3>
                                <span className="text-2xl font-black text-indigo-400">{successProbability}%</span>
                            </div>
                            <div className="flex items-end gap-1 mb-6 h-12">
                                {[0.4, 0.6, 0.8, 0.5, 0.9, 0.7, 1.0].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h * 100}%` }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="flex-1 bg-white/10 rounded-t-sm"
                                    />
                                ))}
                            </div>
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                Our AI analyzed your current trajectory. Complete missing documents to push your probability to 95%+.
                            </p>
                        </motion.div>
                    </div>

                    {/* Recent Applications Cards */}
                    <section>
                        <div className="flex items-center justify-between mb-6 px-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                University Status
                            </h2>
                            <Link to="/portal/applications" className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                Full Details <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {applications.length > 0 ? applications.slice(0, 3).map((app: PortalApplication) => (
                                <motion.div
                                    key={app.id}
                                    whileHover={{ y: -4 }}
                                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg">
                                            {app.university_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 leading-tight">{app.university_name || 'Global Partner'}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{app.course_name || 'Academic Course'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={clsx(
                                            "inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                                            app.status === 'offer_received' ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                                        )}>
                                            {app.status_display}
                                        </span>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">No active applications found.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Action Panel */}
                <div className="space-y-8">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-300" />
                            Action Items
                        </h3>
                        <div className="space-y-4">
                            {activeActions.length > 0 ? activeActions.map((action: PortalNotification) => (
                                <Link key={action.id} to="/portal/notifications" className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                                    <div className="text-left overflow-hidden">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Required</p>
                                        <p className="text-sm font-bold truncate">{action.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )) : (
                                <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">All caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-purple-50/50 -z-0" />
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden relative">
                                {student.counselor_details?.profile_photo ? (
                                    <img src={student.counselor_details.profile_photo} alt="Counselor" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-purple-300" />
                                )}
                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>
                            <h3 className="font-black text-slate-900">Your Counselor</h3>
                            <p className="text-sm text-slate-500 font-medium mb-1">{student.counselor_details?.full_name || 'Academic Support'}</p>
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-6">{student.counselor_details?.role_display || 'Counselor'}</p>

                            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-6 group cursor-pointer hover:bg-purple-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recent Message</span>
                                    <span className="text-[9px] font-bold text-slate-300">2h ago</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                                    "Please check your university portal for the latest CAS update..."
                                </p>
                            </div>

                            <a
                                href={`mailto:${student.counselor_details?.email}`}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all inline-block shadow-lg shadow-slate-200"
                            >
                                Send Message
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboard;
