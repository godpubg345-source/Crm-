import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortalMe } from '../../services/portal';
import type { PortalApplication } from '../../services/portal';
import {
    Building2,
    GraduationCap,
    MapPin,
    Clock,
    ChevronRight,
    Send,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const PortalApplications: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-48 bg-white rounded-[2.5rem]" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-white rounded-[2.5rem]" />
                ))}
            </div>
        );
    }

    const applications = data?.applications ?? [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)] flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif">University Applications</h1>
                    <p className="text-slate-500 font-medium">Track your admission status across global partners.</p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Applications</p>
                        <p className="text-2xl font-black text-slate-900">{applications.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Applications list */}
            <div className="space-y-6">
                {applications.length > 0 ? applications.map((app: PortalApplication) => {
                    // Dynamic Milestone Mapping
                    const milestones = [
                        { label: 'Submitted', date: new Date(app.created_at).toLocaleDateString(), completed: true },
                        {
                            label: 'Under Review',
                            date: app.status !== 'pending' ? 'Processed' : 'Awaiting',
                            completed: app.status !== 'pending'
                        },
                        {
                            label: 'Decision',
                            date: app.status === 'offer_received' ? 'Offer Issued' : app.status === 'rejected' ? 'Declined' : 'Pending',
                            completed: app.status === 'offer_received' || app.status === 'rejected',
                            error: app.status === 'rejected'
                        },
                        {
                            label: 'CAS/Visa',
                            date: 'Awaiting',
                            completed: false
                        }
                    ];

                    return (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-slate-100 font-black text-slate-300 text-3xl">
                                            {app.university_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{app.university_name || 'Partner Institute'}</h2>
                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                    <GraduationCap className="w-4 h-4" />
                                                    {app.course_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                                    <MapPin className="w-4 h-4" />
                                                    {app.country_name || 'United Kingdom'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className={clsx(
                                            "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2",
                                            app.status === 'offer_received' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                app.status === 'rejected' ? "bg-red-50 text-red-600 border border-red-100" :
                                                    "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        )}>
                                            {app.status === 'offer_received' ? <CheckCircle2 className="w-4 h-4" /> :
                                                app.status === 'rejected' ? <AlertCircle className="w-4 h-4" /> :
                                                    <Clock className="w-4 h-4" />}
                                            {app.status_display}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">
                                            Ref: {app.id.substring(0, 8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Progress Tracker */}
                                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100/50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        {milestones.map((m, i) => (
                                            <div key={i} className="space-y-2 relative">
                                                <div className="flex items-center gap-2">
                                                    <div className={clsx(
                                                        "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                                        m.completed ? (m.error ? "bg-rose-500 text-white" : "bg-emerald-500 text-white") : "bg-slate-200 text-slate-400"
                                                    )}>
                                                        {m.completed ? (m.error ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />) : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <p className={clsx(
                                                        "text-[10px] font-black uppercase tracking-widest",
                                                        m.completed ? "text-slate-900" : "text-slate-400"
                                                    )}>{m.label}</p>
                                                </div>
                                                <p className={clsx(
                                                    "text-xs font-bold pl-7",
                                                    m.completed ? "text-slate-600" : "text-slate-300"
                                                )}>{m.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Offer Action Bar */}
                                {app.status === 'offer_received' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 flex flex-wrap gap-4"
                                    >
                                        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-slate-200">
                                            Accept Offer <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="px-6 py-3 bg-white text-slate-900 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-purple-200 transition-all">
                                            Request CAS <ArrowUpRight className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            <div className="bg-slate-50 border-t border-slate-100 px-8 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-purple-600">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        Last Update: <span className="text-slate-900">Document verification passed by HQ</span>
                                    </p>
                                </div>
                                <button className="flex items-center gap-2 text-xs font-black text-purple-600 uppercase tracking-widest group">
                                    View Portal Details
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h2 className="text-xl font-black text-slate-900">No applications yet</h2>
                        <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                            Once you've selected your courses and your counselor has submitted them, they will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Suggestion */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-12 right-12 z-40 lg:hidden"
            >
                <button className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center">
                    <Send className="w-6 h-6" />
                </button>
            </motion.div>
        </div>
    );
};

export default PortalApplications;
