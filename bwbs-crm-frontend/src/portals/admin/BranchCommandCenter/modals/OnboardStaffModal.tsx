import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createUser } from '../../../../services/users';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const OnboardStaffModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    const onboardMutation = useMutation({
        mutationFn: (data: any) => createUser({ ...data, branch: branchId, is_active: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-staff', branchId] });
            reset();
            onClose();
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add staff member">
            <form onSubmit={handleSubmit((data) => onboardMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">First Name</label>
                        <input {...register('first_name', { required: true })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#7c3aed]/20 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400">Last Name</label>
                        <input {...register('last_name', { required: true })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#7c3aed]/20 outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Email Address</label>
                    <input {...register('email', { required: true })} type="email" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#7c3aed]/20 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Role</label>
                    <select {...register('role', { required: true })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                        <option value="COUNSELOR">Counselor</option>
                        <option value="MANAGER">Branch Manager</option>
                        <option value="ADMISSIONS">Admissions Officer</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={onboardMutation.isPending}
                    className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 hover:bg-violet-700"
                >
                    {onboardMutation.isPending ? 'Processing...' : 'Complete Onboarding'}
                </button>
            </form>
        </Modal>
    );
};

export default OnboardStaffModal;
