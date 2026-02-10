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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] p-12 relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] border border-slate-100">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-10 right-10 p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#AD03DE] transition-all active:scale-90"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-5 mb-3">
                        <div className="w-14 h-14 bg-[#AD03DE]/5 rounded-2xl flex items-center justify-center text-[#AD03DE] border border-[#AD03DE]/10 shadow-inner">
                            <ArrowRightLeft className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter">Strategic Transfer</h2>
                            <p className="text-[10px] font-bold text-[#AD03DE] uppercase tracking-[0.4em] opacity-80">Inter-Branch Operative Migration</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-10 premium-scrollbar text-slate-900 font-serif">

                    {/* Target Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setTargetType('LEAD')}
                            className={clsx(
                                "p-6 rounded-3xl border-2 transition-all flex items-center gap-4 group",
                                targetType === 'LEAD' ? "bg-[#AD03DE] border-[#AD03DE] text-white shadow-xl shadow-[#AD03DE]/20" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#AD03DE]/30"
                            )}
                        >
                            <User className={clsx("w-6 h-6", targetType === 'LEAD' ? "text-white" : "text-slate-300 group-hover:text-[#AD03DE]")} />
                            <span className="text-xs font-bold uppercase tracking-widest">Active Lead</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTargetType('STUDENT')}
                            className={clsx(
                                "p-6 rounded-3xl border-2 transition-all flex items-center gap-4 group",
                                targetType === 'STUDENT' ? "bg-[#AD03DE] border-[#AD03DE] text-white shadow-xl shadow-[#AD03DE]/20" : "bg-slate-50 border-slate-100 text-slate-400 hover:border-[#AD03DE]/30"
                            )}
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase tracking-widest">Enrolled Student</span>
                        </button>
                    </div>

                    {/* Target Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <User className="w-3 h-3" /> Select Target
                        </label>
                        <select
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/20 transition-all font-sans font-bold text-slate-700 appearance-none"
                        >
                            <option value="">Choose an operative...</option>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Building2 className="w-3 h-3" /> Origin Node
                            </label>
                            <select
                                value={fromBranchId}
                                onChange={(e) => setFromBranchId(e.target.value)}
                                required
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#AD03DE]/5 transition-all font-sans font-bold text-slate-700"
                            >
                                <option value="">Select Origin...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Building2 className="w-3 h-3" /> Target Node
                            </label>
                            <select
                                value={toBranchId}
                                onChange={(e) => setToBranchId(e.target.value)}
                                required
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#AD03DE]/5 transition-all font-sans font-bold text-slate-700"
                            >
                                <option value="">Select Destination...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <FileText className="w-3 h-3" /> Operational Rationale
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Provide justification for this strategic move..."
                            required
                            rows={4}
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-[#AD03DE]/5 transition-all font-sans font-bold text-slate-700 placeholder:text-slate-300 resize-none font-bold"
                        />
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors px-4"
                    >
                        Abort Request
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={transferMutation.isPending}
                        className="px-12 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3 disabled:opacity-50"
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
