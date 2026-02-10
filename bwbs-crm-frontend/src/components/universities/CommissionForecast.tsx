import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Users, ChevronRight,
    CheckCircle, Clock, FileCheck, GraduationCap
} from 'lucide-react';
import { clsx } from 'clsx';
import { getCommissionForecast } from '../../services/universities';
import type { CommissionForecastData } from '../../services/universities';

interface CommissionForecastWidgetProps {
    data: CommissionForecastData | null;
    isLoading?: boolean;
    onViewUniversity?: (universityId: string) => void;
}

const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '£0';
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

const pipelineConfig = [
    {
        key: 'pending',
        label: 'Pending',
        icon: Clock,
        color: 'bg-amber-50 text-amber-600',
        bgGradient: 'from-amber-500 to-orange-500'
    },
    {
        key: 'offer',
        label: 'Offer',
        icon: FileCheck,
        color: 'bg-blue-50 text-blue-600',
        bgGradient: 'from-blue-500 to-indigo-500'
    },
    {
        key: 'cas_received',
        label: 'CAS Received',
        icon: CheckCircle,
        color: 'bg-purple-50 text-purple-600',
        bgGradient: 'from-purple-500 to-pink-500'
    },
    {
        key: 'enrolled',
        label: 'Enrolled',
        icon: GraduationCap,
        color: 'bg-emerald-50 text-emerald-600',
        bgGradient: 'from-emerald-500 to-teal-500'
    },
];

/**
 * Commission Forecast Widget for HQ Analytics Dashboard
 * Displays projected and earned commissions with pipeline breakdown
 */
export const CommissionForecastWidget: React.FC<CommissionForecastWidgetProps> = ({
    data, isLoading, onViewUniversity
}) => {
    if (isLoading || !data) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 animate-pulse">
                <div className="h-8 bg-slate-100 rounded-xl w-48 mb-6" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const { summary, pipeline, universities } = data;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Forecast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#AD03DE] to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-white/60" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                                Total Forecast
                            </span>
                        </div>
                        <p className="text-4xl font-serif font-black">
                            {formatCurrency(summary.total_forecast)}
                        </p>
                        <p className="text-xs text-white/70 mt-2">
                            {summary.partner_count} partner universities
                        </p>
                    </div>
                </motion.div>

                {/* Earned */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Confirmed Earned
                        </span>
                    </div>
                    <p className="text-3xl font-serif font-black text-emerald-600">
                        {formatCurrency(summary.total_earned)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        From enrolled students
                    </p>
                </motion.div>

                {/* Projected */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Projected
                        </span>
                    </div>
                    <p className="text-3xl font-serif font-black text-blue-600">
                        {formatCurrency(summary.total_projected)}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        Weighted pipeline value
                    </p>
                </motion.div>
            </div>

            {/* Pipeline Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-[#AD03DE]" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        Pipeline Breakdown
                    </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {pipelineConfig.map((stage, index) => {
                        const key = stage.key as keyof typeof pipeline;
                        const stageData = pipeline[key];
                        // Handle union type differences
                        const value = 'earned' in stageData ? (stageData as any).earned : (stageData as any).projected;

                        return (
                            <motion.div
                                key={stage.key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={clsx(
                                    "p-4 rounded-2xl border",
                                    stage.color
                                )}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <stage.icon className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {stage.label}
                                    </span>
                                </div>
                                <p className="text-2xl font-black mb-1">
                                    {stageData.count}
                                </p>
                                <p className="text-[10px] font-bold opacity-70">
                                    {formatCurrency(value)} • {stageData.probability}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Top Revenue Partners */}
            {universities.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[#AD03DE]" />
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                Top Revenue Partners
                            </h3>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">
                            {universities.length} partners
                        </span>
                    </div>

                    <div className="space-y-3">
                        {universities.slice(0, 8).map((uni: any, index: number) => {
                            const totalRevenue = parseFloat(uni.earned) + parseFloat(uni.projected);
                            const maxRevenue = parseFloat(universities[0].earned) + parseFloat((universities[0] as any).projected);
                            const barWidth = maxRevenue > 0 ? (totalRevenue / maxRevenue) * 100 : 0;

                            return (
                                <motion.div
                                    key={uni.university_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onViewUniversity?.(uni.university_id)}
                                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group"
                                >
                                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-black text-slate-400">
                                            #{index + 1}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-black text-slate-900 truncate">
                                                {uni.university_name}
                                            </h4>
                                            <span className="text-sm font-black text-[#AD03DE]">
                                                {formatCurrency(String(totalRevenue))}
                                            </span>
                                        </div>

                                        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${barWidth}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#AD03DE] to-purple-400 rounded-full"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[9px] font-bold text-emerald-600">
                                                Earned: {formatCurrency(uni.earned)}
                                            </span>
                                            <span className="text-[9px] font-bold text-blue-600">
                                                Projected: {formatCurrency(uni.projected)}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">
                                                {uni.stats.enrolled} enrolled
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#AD03DE] transition-colors" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Compact Commission Card for University Cards
 */
interface CompactCommissionCardProps {
    earned: string;
    projected: string;
    enrolledCount: number;
}

export const CompactCommissionCard: React.FC<CompactCommissionCardProps> = ({
    earned, projected, enrolledCount
}) => {
    return (
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                    Commission
                </span>
            </div>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-lg font-black text-emerald-700">
                        {formatCurrency(earned)}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-500">
                        +{formatCurrency(projected)} projected
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-600">{enrolledCount}</p>
                    <p className="text-[8px] font-bold text-slate-400">enrolled</p>
                </div>
            </div>
        </div>
    );
};

export default CommissionForecastWidget;

/**
 * Smart Component: Commission Forecast with Data Fetching
 */
export const SmartCommissionForecast: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { data: forecast, isLoading } = useQuery({
        queryKey: ['commissionForecast'],
        queryFn: getCommissionForecast,
        refetchInterval: 60000
    });

    return (
        <div className="h-full flex flex-col">
            {onBack && (
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180 text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">Commission Intelligence</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Performance Vector</p>
                    </div>
                </div>
            )}
            <CommissionForecastWidget
                data={forecast || null}
                isLoading={isLoading}
            />
        </div>
    );
};
