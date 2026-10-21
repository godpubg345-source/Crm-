import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empGetAttendanceLogs, empClockIn, empClockOut, empGetMyProfile } from '../../services/empPortal';
import { Clock, CalendarDays, Loader2, CheckCircle2, AlertCircle, Sparkles, TrendingUp, History } from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';

const safeFormatDate = (dateVal?: string | null, fmt = 'MMM dd, yyyy'): string => {
    if (!dateVal) return 'N/A';
    try {
        const parsed = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
        return isNaN(parsed.getTime()) ? 'N/A' : format(parsed, fmt);
    } catch {
        return 'N/A';
    }
};

const safeFormatTime = (timeVal?: string | null, fmt = 'HH:mm'): string => {
    if (!timeVal) return '--:--';
    try {
        const parsed = typeof timeVal === 'string' ? parseISO(timeVal) : new Date(timeVal);
        return isNaN(parsed.getTime()) ? '--:--' : format(parsed, fmt);
    } catch {
        return '--:--';
    }
};

const EmpAttendance: React.FC = () => {
    const queryClient = useQueryClient();
    const [notes, setNotes] = useState('');
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const { data: rawLogs, isLoading: isLogsLoading } = useQuery({
        queryKey: ['myAttendance', profile?.id],
        queryFn: () => empGetAttendanceLogs(undefined, profile?.id),
        enabled: !!profile?.id,
    });

    const logs = useMemo(() => {
        if (!rawLogs) return [];
        return Array.isArray(rawLogs) ? rawLogs : (rawLogs as any)?.results || [];
    }, [rawLogs]);

    const clockInMutation = useMutation({
        mutationFn: () => empClockIn(profile?.branch || '', notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
            setNotes('');
            setActionMessage('Clocked in successfully! Have a productive counseling session.');
            setTimeout(() => setActionMessage(null), 3000);
        },
    });

    const clockOutMutation = useMutation({
        mutationFn: (logId: string) => empClockOut(logId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
            setActionMessage('Clocked out successfully! Shift recorded.');
            setTimeout(() => setActionMessage(null), 3000);
        },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find((log: any) => log.date === todayStr);
    const isClockedIn = !!todayLog?.clock_in && !todayLog?.clock_out;
    const hasWorkedToday = !!todayLog?.clock_in && !!todayLog?.clock_out;

    const isLoading = isProfileLoading || (!!profile?.id && isLogsLoading);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    // Stats calculations
    const totalHoursLogged = logs.reduce((acc: number, l: any) => acc + (parseFloat(l.total_hours) || 0), 0);
    const presentDays = logs.filter((l: any) => !!l.clock_in && !l.is_on_leave).length;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-500" /> Digital Timecard
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Time & Attendance</h1>
                    <p className="text-slate-500 font-medium">Record daily shift clock-ins, breaks, and view verified monthly work history.</p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Present</p>
                        <p className="text-2xl font-black font-serif text-slate-900">{presentDays} Days</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-teal-600">Total Hours</p>
                        <p className="text-2xl font-black font-serif text-teal-700">{totalHoursLogged.toFixed(1)}h</p>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {actionMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{actionMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clock In / Out Card */}
                <div className="lg:col-span-1 border border-slate-100 bg-white rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
                    {/* Decorative Background Blob */}
                    <div className={clsx(
                        "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3 transition-colors duration-500",
                        isClockedIn ? "bg-amber-400" : hasWorkedToday ? "bg-emerald-300" : "bg-teal-400"
                    )} />

                    <div className="relative z-10 w-full">
                        <div className={clsx(
                            "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner border-4 transition-all",
                            isClockedIn ? "bg-amber-50 text-amber-500 border-amber-100 ring-8 ring-amber-50/50"
                                : hasWorkedToday ? "bg-emerald-50 text-emerald-600 border-emerald-100 ring-8 ring-emerald-50/50"
                                    : "bg-teal-50 text-teal-600 border-teal-100 ring-8 ring-teal-50/50"
                        )}>
                            <Clock className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-1">
                            {format(new Date(), 'EEEE, MMMM do')}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                            London Central Branch • BST (UTC+1)
                        </p>

                        <div className="mb-8 font-black font-serif text-5xl text-slate-800 tracking-tighter">
                            {format(new Date(), 'HH:mm')}
                        </div>

                        {hasWorkedToday ? (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                <p className="text-sm font-black text-emerald-900">Shift Completed</p>
                                <p className="text-xs text-emerald-700 mt-0.5">
                                    Logged {todayLog?.total_hours || '0.00'} hours today.
                                </p>
                            </div>
                        ) : isClockedIn ? (
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                    Active Shift: Clocked in at {safeFormatTime(todayLog?.clock_in, 'hh:mm a')}
                                </div>

                                <button
                                    onClick={() => todayLog && clockOutMutation.mutate(todayLog.id)}
                                    disabled={clockOutMutation.isPending}
                                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                                >
                                    {clockOutMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Clock Out Now'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Optional shift notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-medium focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => clockInMutation.mutate()}
                                    disabled={clockInMutation.isPending}
                                    className="w-full h-14 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {clockInMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Clock In Now'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 font-serif">Attendance Records</h3>
                                    <p className="text-xs text-slate-400 font-medium">Historical punch-in logs with verified timestamps</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                                {logs.length} Logged
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Clock In</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Clock Out</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-50">
                                    {logs.slice(0, 10).map((log: any) => {
                                        const rawStatus = log.status || (log.is_on_leave ? 'ON_LEAVE' : log.clock_in ? 'PRESENT' : 'ABSENT');
                                        const displayStatus = String(rawStatus).replace('_', ' ');

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-4 font-bold text-slate-900">
                                                    {safeFormatDate(log.date)}
                                                </td>
                                                <td className="py-4">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                                                        rawStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            rawStatus === 'ABSENT' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                                rawStatus === 'ON_LEAVE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                    )}>
                                                        {displayStatus}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-slate-600 font-mono text-xs">
                                                    {safeFormatTime(log.clock_in)}
                                                </td>
                                                <td className="py-4 text-slate-600 font-mono text-xs">
                                                    {safeFormatTime(log.clock_out)}
                                                </td>
                                                <td className="py-4 text-right font-mono font-black text-slate-900">
                                                    {log.total_hours ? `${parseFloat(log.total_hours).toFixed(1)}h` : '0.0h'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span>Showing recent daily shift entries</span>
                        <span className="flex items-center gap-1 text-teal-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with Central HR
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpAttendance;
