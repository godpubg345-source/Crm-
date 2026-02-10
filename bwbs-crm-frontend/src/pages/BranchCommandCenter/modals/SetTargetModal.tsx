import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createBranchTarget } from '../../../services/branches';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const SetTargetModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    const targetMutation = useMutation({
        mutationFn: (data: any) => createBranchTarget({ ...data, branch: branchId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-targets', branchId] });
            reset();
            onClose();
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Define Regional Quota">
            <form onSubmit={handleSubmit((data) => targetMutation.mutate(data))} className="space-y-6">
                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-indigo-500 transition-colors mb-1">Target Month</label>
                    <input {...register('month', { required: true })} type="month" className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-indigo-500 transition-colors mb-1">Lead Volume</label>
                        <input {...register('target_leads', { required: true })} type="number" placeholder="0" className="w-full bg-transparent text-lg font-serif font-bold text-slate-900 outline-none placeholder:text-slate-300" />
                    </div>
                    <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-indigo-500 transition-colors mb-1">Enrollments</label>
                        <input {...register('target_enrollments', { required: true })} type="number" placeholder="0" className="w-full bg-transparent text-lg font-serif font-bold text-slate-900 outline-none placeholder:text-slate-300" />
                    </div>
                </div>

                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-indigo-500 transition-colors mb-1">Revenue Goal (GBP)</label>
                    <input {...register('target_revenue', { required: true })} type="number" placeholder="0.00" className="w-full bg-transparent text-2xl font-serif font-black text-indigo-900 outline-none placeholder:text-slate-300" />
                </div>

                <button
                    type="submit"
                    disabled={targetMutation.isPending}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#AD03DE] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {targetMutation.isPending ? 'Syncing Target...' : 'Deploy Regional Quota'}
                </button>
            </form>
        </Modal>
    );
};

export default SetTargetModal;
