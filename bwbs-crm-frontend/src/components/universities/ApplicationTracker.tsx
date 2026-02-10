import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, GraduationCap,
    AlertTriangle, ChevronRight, Users
} from 'lucide-react';
import { clsx } from 'clsx';

interface ApplicationStats {
    pending: number;
    offer: number;
    cas_received: number;
    enrolled: number;
    rejected: number;
}

interface ApplicationTrackerProps {
    universityId: number;
    universityName: string;
    stats: ApplicationStats;
    onViewAll: () => void;
}

const statusConfig = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { key: 'offer', label: 'Offer', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { key: 'cas_received', label: 'CAS', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { key: 'enrolled', label: 'Enrolled', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
    { key: 'rejected', label: 'Rejected', icon: AlertTriangle, color: 'bg-rose-50 text-rose-500' },
];

/**
 * Compact Application Tracker Widget for University Cards
 */
export const ApplicationTrackerWidget: React.FC<ApplicationTrackerProps> = ({
    universityId: _universityId, universityName: _universityName, stats, onViewAll
}) => {
    const totalApplications = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Applications
                    </span>
                </div>
                <span className="text-lg font-black text-slate-900">{totalApplications}</span>
            </div>

            {/* Mini Status Grid */}
            <div className="grid grid-cols-5 gap-2 mb-3">
                {statusConfig.map((status) => (
                    <div
                        key={status.key}
                        className="text-center"
                    >
                        <div className={clsx(
                            "w-full aspect-square rounded-xl flex items-center justify-center mb-1",
                            status.color
                        )}>
                            <span className="text-xs font-black">
                                {stats[status.key as keyof ApplicationStats]}
                            </span>
                        </div>
                        <p className="text-[7px] font-bold text-slate-400 uppercase">
                            {status.label}
                        </p>
                    </div>
                ))}
            </div>

            <button
                onClick={onViewAll}
                className="w-full py-2 text-[9px] font-black text-[#AD03DE] uppercase tracking-widest hover:bg-[#AD03DE]/5 rounded-xl transition-all flex items-center justify-center gap-1"
            >
                View All <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );
};

/**
 * Full Application Pipeline Board (University-Centric View)
 */
interface Application {
    id: number;
    student_name: string;
    course_name: string;
    status: string;
    applied_at: string;
    updated_at: string;
}

interface ApplicationBoardProps {
    applications: Application[];
    universityName: string;
}

export const ApplicationBoard: React.FC<ApplicationBoardProps> = ({
    applications, universityName
}) => {
    const grouped = statusConfig.reduce((acc, status) => {
        acc[status.key] = applications.filter(app =>
            app.status.toLowerCase().replace('_', '') === status.key.replace('_', '')
        );
        return acc;
    }, {} as Record<string, Application[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tight">
                        Application Pipeline
                    </h3>
                    <p className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest">
                        {universityName}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Total: {applications.length}
                    </span>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-5 gap-4">
                {statusConfig.map((status) => (
                    <div
                        key={status.key}
                        className="bg-slate-50 rounded-2xl p-4 min-h-[300px]"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className={clsx(
                                "p-2 rounded-lg",
                                status.color
                            )}>
                                <status.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase">
                                    {status.label}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400">
                                    {grouped[status.key]?.length || 0} apps
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {grouped[status.key]?.map((app) => (
                                <motion.div
                                    key={app.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                    <p className="text-[10px] font-black text-slate-900 truncate mb-1">
                                        {app.student_name}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-400 truncate">
                                        {app.course_name}
                                    </p>
                                </motion.div>
                            ))}

                            {(!grouped[status.key] || grouped[status.key].length === 0) && (
                                <div className="text-center py-8 text-slate-300">
                                    <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-[8px] font-bold uppercase">No Applications</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Suggested Universities Widget for Lead Detail Page
 */
interface SuggestedUniversity {
    id: number;
    name: string;
    country: string;
    match_score: number;
    logo?: string;
}

interface SuggestedUniversitiesProps {
    suggestions: SuggestedUniversity[];
    onAddToShortlist: (id: number) => void;
    onViewDetails: (id: number) => void;
}

export const SuggestedUniversitiesWidget: React.FC<SuggestedUniversitiesProps> = ({
    suggestions, onAddToShortlist, onViewDetails
}) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-[#AD03DE]/5 to-purple-50 rounded-3xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#AD03DE]/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#AD03DE]" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        AI Recommendations
                    </h4>
                    <p className="text-[8px] font-bold text-[#AD03DE] uppercase tracking-widest">
                        Based on Student Profile
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {suggestions.slice(0, 3).map((uni, idx) => (
                    <div
                        key={uni.id}
                        className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg font-black text-slate-400">
                            {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-900 truncate">
                                {uni.name}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {uni.country}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-black text-[#AD03DE]">
                                {uni.match_score}%
                            </p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase">Match</p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => onViewDetails(uni.id)}
                                className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                            >
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                                onClick={() => onAddToShortlist(uni.id)}
                                className="p-2 bg-[#AD03DE]/10 rounded-lg hover:bg-[#AD03DE]/20 transition-all"
                            >
                                <CheckCircle className="w-3 h-3 text-[#AD03DE]" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-3 bg-white text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                View All Recommendations
            </button>
        </div>
    );
};
