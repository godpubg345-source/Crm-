import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, MoreHorizontal, CalendarClock, Zap, Calendar } from 'lucide-react';
import clsx from 'clsx';
import {
    getAttendanceLogs,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
    clockOutAllStaff,
    exportPersonnelLog,
    type AttendanceLog,
    type LeaveRequest
} from '../../../../services/users';
import type { TeamTabProps } from '../types';

const TeamTab = ({ branchId, staff, onOnboard }: TeamTabProps) => {
    const queryClient = useQueryClient();
    const { data: attendance } = useQuery<AttendanceLog[]>({ queryKey: ['branch-attendance', branchId], queryFn: () => getAttendanceLogs(branchId) });
    const { data: leave } = useQuery<LeaveRequest[]>({ queryKey: ['branch-leave', branchId], queryFn: () => getLeaveRequests(branchId) });

    const approveMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string, notes?: string }) => approveLeave(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-leave', branchId] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string, notes?: string }) => rejectLeave(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-leave', branchId] });
        }
    });

    const clockOutMutation = useMutation({
        mutationFn: () => clockOutAllStaff(branchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-attendance', branchId] });
        }
    });

    const handleExport = async () => {
        try {
            const blob = await exportPersonnelLog(branchId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `attendance_${branchId}_${date}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export personnel log', error);
        }
    };

    const pendingLeave = leave?.filter((l: LeaveRequest) => l.status === 'PENDING') || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Staff</h2>
                    <p className="text-xs text-slate-500 mt-2">Staff, attendance and leave</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <button
                        onClick={onOnboard}
                        className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-violet-700 transition-all"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Add staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Staff List */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h4 className="text-[11px] font-semibold text-slate-900">Staff list</h4>
                        <span className="text-xs font-semibold text-[#7c3aed]">{staff?.length || 0} Entities</span>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/20">
                                <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff</th>
                                <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics</th>
                                <th className="px-6 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {staff?.map(member => (
                                <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center text-lg font-semibold text-slate-400 transition-transform">
                                                {member.first_name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{member.first_name} {member.last_name}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-1">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-xs font-semibold text-[#7c3aed] bg-[#7c3aed]/5 px-3 py-1 rounded-lg border border-[#7c3aed]/10">
                                            {member.role_display}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("w-2 h-2 rounded-full", member.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                            <span className="text-xs font-semibold text-slate-500">
                                                {member.is_active ? 'Online' : 'Restricted'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center w-24">
                                                <span className="text-[11px] text-slate-500">XP</span>
                                                <span className="text-xs font-semibold text-slate-800">{member.performance?.points || 0}</span>
                                            </div>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#7c3aed] transition-all" style={{ width: `${Math.min((member.performance?.points || 0) / 10, 100)}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sidebar Info & Pending Leave */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <h4 className="text-[11px] font-semibold text-slate-400">Attendance</h4>
                            <CalendarClock className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Today's Check-ins</span>
                                <span className="text-2xl font-semibold text-slate-900">{attendance?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-xs font-bold text-slate-500">Leave</span>
                                <span className="text-2xl font-semibold text-[#7c3aed]">{pendingLeave.length} Pending</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Leave Requests */}
                    {pendingLeave.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <h4 className="text-[11px] font-semibold text-slate-900">Leave Requests</h4>
                                <Calendar className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="divide-y divide-slate-50">
                                {pendingLeave.map((request: LeaveRequest) => (
                                    <div key={request.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-semibold text-slate-900">{request.user_name || 'Staff'}</p>
                                            <span className="text-[11px] font-semibold text-[#7c3aed] bg-[#7c3aed]/5 px-2 py-0.5 rounded-full border border-[#7c3aed]/10">{request.leave_type_display}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">{request.start_date} to {request.end_date}</p>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => approveMutation.mutate({ id: request.id })}
                                                disabled={approveMutation.isPending}
                                                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[11px] font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => rejectMutation.mutate({ id: request.id })}
                                                disabled={rejectMutation.isPending}
                                                className="flex-1 py-3 bg-slate-100 text-slate-400 rounded-xl text-[11px] font-semibold hover:bg-slate-200 hover:text-slate-600 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-[#7c3aed] to-indigo-700 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden group">
                        <Zap className="absolute top-0 right-0 w-32 h-32 text-white/5 -rotate-12 translate-x-4 -translate-y-4 transition-transform duration-200" />
                        <h4 className="text-[11px] font-semibold opacity-60 mb-8">Branch settings</h4>
                        <button
                            onClick={() => clockOutMutation.mutate()}
                            disabled={clockOutMutation.isPending}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-semibold shadow-sm transition-all mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {clockOutMutation.isPending ? 'Clocking Out...' : 'Clock Out All Staff'}
                        </button>
                        <button
                            onClick={handleExport}
                            className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl text-xs font-semibold hover:bg-white/20 transition-all"
                        >
                            Export staff list
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamTab;
