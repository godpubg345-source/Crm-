import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBranches, createTransferRequest } from '../../services/branches';
import { getLeads } from '../../services/leads';
import { getStudents } from '../../services/students';
import { X, Send, ArrowRightLeft, Building2, User, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

interface TransferRequestModalProps {
    onClose: () => void;
}

const TransferRequestModal = ({ onClose }: TransferRequestModalProps) => {
    const queryClient = useQueryClient();
    const [targetType, setTargetType] = useState<'LEAD' | 'STUDENT'>('LEAD');
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [fromBranchId, setFromBranchId] = useState('');
    const [toBranchId, setToBranchId] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        setSelectedTargetId('');
    }, [targetType]);

    const { data: branches = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches
    });

    const { data: leadsData } = useQuery({
        queryKey: ['leads'],
        queryFn: () => getLeads(),
        enabled: targetType === 'LEAD'
    });

    const { data: studentsData } = useQuery({
        queryKey: ['students'],
        queryFn: () => getStudents(),
        enabled: targetType === 'STUDENT'
    });

    const leads = leadsData?.results || [];
    const students = studentsData?.results || [];

    const transferMutation = useMutation({
        mutationFn: createTransferRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTargetId || !fromBranchId || !toBranchId || !reason) return;

        transferMutation.mutate({
            [targetType === 'LEAD' ? 'lead' : 'student']: selectedTargetId,
            from_branch: fromBranchId,
            to_branch: toBranchId,
            reason: reason,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-10 right-10 p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#7c3aed] transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-5 mb-3">
                        <div className="w-10 h-10 bg-[#7c3aed]/5 rounded-lg flex items-center justify-center text-[#7c3aed] border border-[#7c3aed]/10">
                            <ArrowRightLeft className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Transfer</h2>
                            <p className="text-xs font-bold text-[#7c3aed] opacity-80">Move a lead or student to another branch</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-6 premium-scrollbar text-slate-900">

                    {/* Target Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setTargetType('LEAD')}
                            className={clsx(
                                "p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                targetType === 'LEAD' ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm " : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#7c3aed]/30"
                            )}
                        >
                            <User className={clsx("w-6 h-6", targetType === 'LEAD' ? "text-white" : "text-slate-300 group-hover:text-[#7c3aed]")} />
                            <span className="text-xs font-bold">Active Lead</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetType('STUDENT')}
                            className={clsx(
                                "p-6 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                                targetType === 'STUDENT' ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm " : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#7c3aed]/30"
                            )}
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-xs font-bold">Enrolled Student</span>
                        </button>
                    </div>

                    {/* Target Selection */}
                    <div className="space-y-4">
                        <label className="text-xs text-slate-500 flex items-center gap-2 px-1">
                            <User className="w-3 h-3" /> Select Target
                        </label>
                        <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/20 transition-all font-sans font-bold text-slate-700 appearance-none"
                        >
                            <option value="">Choose...</option>
                            {targetType === 'LEAD' && leads.map(lead => (
                                <option key={lead.id} value={lead.id}>{lead.first_name} {lead.last_name} ({lead.email})</option>
                            ))}
                            {targetType === 'STUDENT' && students.map(student => (
                                <option key={student.id} value={student.id}>{student.first_name} {student.last_name} ({student.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Logistics Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs text-slate-500 flex items-center gap-2 px-1">
                                <Building2 className="w-3 h-3" /> From branch
                            </label>
                            <select
                                value={fromBranchId}
                                onChange={(e) => setFromBranchId(e.target.value)}
                                required
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#7c3aed]/5 transition-all font-sans font-bold text-slate-700"
                            >
                                <option value="">Select branch...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs text-slate-500 flex items-center gap-2 px-1">
                                <Building2 className="w-3 h-3" /> To branch
                            </label>
                            <select
                                value={toBranchId}
                                onChange={(e) => setToBranchId(e.target.value)}
                                required
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#7c3aed]/5 transition-all font-sans font-bold text-slate-700"
                            >
                                <option value="">Select branch...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-4">
                        <label className="text-xs text-slate-500 flex items-center gap-2 px-1">
                            <FileText className="w-3 h-3" /> Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why is this being moved?"
                            required
                            rows={4}
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#7c3aed]/5 transition-all font-sans font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="mt-6 pt-10 border-t border-slate-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-slate-500 hover:text-rose-500 transition-colors px-4"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={transferMutation.isPending}
                        className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                    >
                        {transferMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Initialize Migration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransferRequestModal;
