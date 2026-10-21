import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empGetLeaveRequests, empCreateLeaveRequest, empGetMyProfile } from '../../services/empPortal';
import { CalendarOff, Send, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';

const EmpLeaves: React.FC = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        leave_type: 'ANNUAL',
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [error, setError] = useState('');

    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['myLeaves', profile?.id],
        queryFn: () => empGetLeaveRequests(undefined, profile?.id),
        enabled: !!profile?.id,
    });

    const submitMutation = useMutation({
        mutationFn: () => empCreateLeaveRequest({ ...formData, branch: profile?.branch || '' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
            setFormData({ leave_type: 'ANNUAL', start_date: '', end_date: '', reason: '' });
            setError('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to submit leave request. Please check your dates.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.start_date || !formData.end_date || !formData.reason) {
            setError('Please fill out all required fields.');
            return;
        }
        submitMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">Leave Management</h1>
                    <p className="text-slate-500 font-medium">Request time off and track your leave balances.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Request Form */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <CalendarOff className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-serif">New Request</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Leave Type</label>
                            <select
                                value={formData.leave_type}
                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                            >
                                <option value="ANNUAL">Annual Leave</option>
                                <option value="SICK">Sick Leave</option>
                                <option value="UNPAID">Unpaid Leave</option>
                                <option value="COMPENSATORY">Compensatory Off</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 pl-1">Reason</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="Briefly describe the reason for your leave..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="w-full h-14 mt-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>Submit Request</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Leave History */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-6">Request History</h3>

                    <div className="space-y-4">
                        {leaves?.map((leave: any) => (
                            <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="mb-4 sm:mb-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-slate-900">{leave.leave_type_display}</span>
                                        <span className={clsx(
                                            "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                                            leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                leave.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                        )}>
                                            {leave.status_display}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {leave.start_date ? format(parseISO(leave.start_date), 'MMM dd, yyyy') : 'N/A'} - {leave.end_date ? format(parseISO(leave.end_date), 'MMM dd, yyyy') : 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">{leave.reason}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 font-serif">{leave.total_days}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Days</p>
                                </div>
                            </div>
                        ))}
                        {(!leaves || leaves.length === 0) && (
                            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-[1.5rem] border border-slate-100 border-dashed">
                                No leave requests found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmpLeaves;
