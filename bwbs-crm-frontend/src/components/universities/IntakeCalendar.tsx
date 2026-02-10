import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Calendar as CalendarIcon, Beaker, Map,
    TrendingUp, Users, ChevronRight,
    PieChart, Activity, Building, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { getUniversityAnalytics, getCommissionForecast, getIntakeCalendar } from '../../services/universities';

/**
 * Intake Visualization Calendar
 */
export const IntakeCalendar: React.FC = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const { data: intakeData, isLoading } = useQuery({
        queryKey: ['intake-calendar'],
        queryFn: () => getIntakeCalendar(),
        refetchInterval: 600000
    });

    const monthIndex: Record<string, number> = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11
    };

    const monthStats = new Map<number, { count: number; label: string; year: number }>();
    intakeData?.calendar?.forEach((entry) => {
        const idx = monthIndex[entry.month];
        if (idx === undefined) return;
        const count = entry.courses.length;
        monthStats.set(idx, { count, label: entry.month, year: entry.year });
    });

    const maxCount = Math.max(...Array.from(monthStats.values()).map((m) => m.count), 1);
    const sortedUpcoming = (intakeData?.calendar || [])
        .map((entry) => ({
            month: entry.month,
            year: entry.year,
            idx: monthIndex[entry.month] ?? 0,
            count: entry.courses.length
        }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => (a.year - b.year) || (a.idx - b.idx));

    const nextWindow = sortedUpcoming.find((entry) =>
        entry.year > currentYear || (entry.year === currentYear && entry.idx >= currentMonth)
    ) || sortedUpcoming[0];

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tight">Intake Vector</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Enrollment Cycles</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-50 text-[9px] font-black uppercase text-slate-400 rounded-xl border border-slate-100">Filter By Region</button>
                    <button className="px-4 py-2 bg-slate-900 text-[9px] font-black uppercase text-white rounded-xl shadow-lg">{currentYear} Cycle</button>
                </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {months.map((m, i) => {
                    const stat = monthStats.get(i);
                    const hasIntakes = !!stat && stat.count > 0;
                    const pct = hasIntakes ? Math.round((stat.count / maxCount) * 100) : 0;

                    return (
                        <motion.div
                            key={m}
                            whileHover={{ y: -5 }}
                            className={clsx(
                                "relative aspect-square p-4 rounded-3xl border transition-all cursor-pointer overflow-hidden group",
                                i === currentMonth ? "bg-[#AD03DE] border-[#AD03DE] shadow-xl shadow-purple-200" :
                                    hasIntakes ? "bg-white border-slate-100" : "bg-slate-50 border-transparent opacity-60"
                            )}
                        >
                            <p className={clsx(
                                "text-[10px] font-black tracking-widest leading-none mb-2",
                                i === currentMonth ? "text-white" : "text-slate-400 uppercase"
                            )}>{m}</p>

                            {isLoading && i === currentMonth && (
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden animate-pulse" />
                            )}

                            {hasIntakes && (
                                <div className="space-y-2">
                                    <div className="h-1.5 w-full bg-[#AD03DE]/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#AD03DE]" style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className={clsx(
                                        "text-[8px] font-black uppercase",
                                        i === currentMonth ? "text-white/80" : "text-slate-900"
                                    )}>{stat.count} Courses</p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Beaker className="w-5 h-5 text-[#AD03DE]" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Next Critical Window: {nextWindow ? `${nextWindow.month} ${nextWindow.year}` : 'TBD'}
                    </p>
                </div>
                <button className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage Intakes <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

/**
 * HQ Intelligence Dashboard
 */
export const UniversityAnalytics: React.FC<{ onViewForecast?: () => void }> = ({ onViewForecast }) => {
    // Fetch Analytics Data
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['universityAnalytics'],
        queryFn: getUniversityAnalytics,
        refetchInterval: 60000 // Refresh every minute
    });

    // Fetch Commission Forecast
    const { data: forecast, isLoading: forecastLoading } = useQuery({
        queryKey: ['commissionForecast'],
        queryFn: getCommissionForecast,
        refetchInterval: 60000
    });

    if (analyticsLoading || forecastLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#AD03DE] animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calibrating Strategy Matrix...</p>
            </div>
        );
    }

    const formatCurrency = (val: string | number) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) return '£0';
        // Compact notation for large numbers
        if (num >= 1000000) return `£${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `£${(num / 1000).toFixed(1)}k`;
        return `£${num.toFixed(0)}`;
    };

    return (
        <div className="space-y-8 h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#AD03DE]/30 transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-[#AD03DE]/10 transition-colors">
                            <Building className="w-5 h-5 text-slate-400 group-hover:text-[#AD03DE]" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partner Institutions</p>
                    <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">{analytics?.total_partners || 0}</h4>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#AD03DE]/30 transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-[#AD03DE]/10 transition-colors">
                            <Users className="w-5 h-5 text-slate-400 group-hover:text-[#AD03DE]" />
                        </div>
                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Pipeline</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Applications</p>
                    <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">
                        {(forecast?.pipeline?.pending?.count || 0) + (forecast?.pipeline?.offer?.count || 0) + (forecast?.pipeline?.cas_received?.count || 0)}
                    </h4>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#AD03DE]/30 transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-[#AD03DE]/10 transition-colors">
                            <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-[#AD03DE]" />
                        </div>
                        <span className="text-[9px] font-black text-purple-500 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-widest">Forecast</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Revenue</p>
                    <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">{formatCurrency(forecast?.summary?.total_forecast || 0)}</h4>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:border-[#AD03DE]/30 transition-all"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-[#AD03DE]/10 transition-colors">
                            <Activity className="w-5 h-5 text-slate-400 group-hover:text-[#AD03DE]" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Confirmed</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned Commission</p>
                    <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">{formatCurrency(forecast?.summary?.total_earned || 0)}</h4>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Performance Map Matrix */}
                <div className="md:col-span-2 bg-slate-900 rounded-[3rem] p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#AD03DE]/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">Global Reach</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Geographic Partner Density</p>
                            </div>
                            <Map className="w-6 h-6 text-[#AD03DE]" />
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full space-y-6">
                                {analytics?.geographic_reach && analytics.geographic_reach.length > 0 ? (
                                    analytics.geographic_reach.map((reg: any) => {
                                        const pct = analytics.total_universities > 0 ? (reg.count / analytics.total_universities) * 100 : 0;
                                        const color = reg.country === 'United Kingdom' ? '#AD03DE' :
                                            reg.country === 'United States' ? '#6366f1' :
                                                reg.country === 'Canada' ? '#ec4899' : '#10b981';

                                        return (
                                            <div key={reg.country} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{reg.country}</p>
                                                    <p className="text-[10px] font-black text-slate-400">{pct.toFixed(1)}% ({reg.count})</p>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        className="h-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-sm text-slate-500 font-bold">No geographic data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Institutions List */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tight">Top Partners</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">By Revenue Projection</p>
                        </div>
                        <PieChart className="w-6 h-6 text-slate-200" />
                    </div>

                    <div className="flex-1 space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {forecast?.universities && forecast.universities.length > 0 ? (
                            forecast.universities.slice(0, 5).map((uni: any, i: number) => (
                                <div key={uni.university_id} className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 text-[10px]">{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-900 uppercase truncate" title={uni.university_name}>{uni.university_name}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                {formatCurrency(parseFloat(uni.earned) + parseFloat(uni.projected))}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-[#AD03DE]" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-xs text-slate-400">No active partner data</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onViewForecast}
                        className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-[#AD03DE] hover:bg-slate-100 transition-all mt-10"
                    >
                        View Full Forecast Widget
                    </button>
                </div>
            </div>
        </div>
    );
};
