import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createBranchComplaint } from '../../../services/branches';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const AddComplaintModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    const complaintMutation = useMutation({
        mutationFn: (data: any) => createBranchComplaint({ ...data, branch: branchId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-complaints', branchId] });
            reset();
            onClose();
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lodge Regional Grievance">
            <form onSubmit={handleSubmit((data) => complaintMutation.mutate(data))} className="space-y-6">
                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-rose-500 transition-colors mb-1">Subject</label>
                    <input {...register('subject', { required: true })} className="w-full bg-transparent text-lg font-serif font-bold text-slate-900 outline-none placeholder:text-slate-300" placeholder="e.g. Infrastructure Failure" />
                </div>

                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-rose-500 transition-colors mb-1">Priority Level</label>
                    <select {...register('priority', { required: true })} className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none">
                        <option value="MEDIUM">Normal Processing</option>
                        <option value="HIGH">High Priority</option>
                        <option value="URGENT">Urgent - Immediate Action Required</option>
                    </select>
                </div>

                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-rose-500 transition-colors mb-1">Detailed Report</label>
                    <textarea {...register('description', { required: true })} rows={4} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-300 resize-none" placeholder="Describe the incident or issue..." />
                </div>

                <button
                    type="submit"
                    disabled={complaintMutation.isPending}
                    className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                >
                    {complaintMutation.isPending ? 'Logging Incident...' : 'Lodge Official Complaint'}
                </button>
            </form>
        </Modal>
    );
};

export default AddComplaintModal;
