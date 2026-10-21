import { useForm } from 'react-hook-form';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const BroadcastModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const { register, handleSubmit, reset } = useForm();

    const handleBroadcast = (data: any) => {
        console.log('Broadcasting to branch:', branchId, data);
        alert('Regional broadcast initiated via system relays');
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Send announcement">
            <form onSubmit={handleSubmit(handleBroadcast)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Target Audience</label>
                    <select {...register('audience')} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                        <option value="ALL">All staff</option>
                        <option value="COUNSELORS">Counselors Only</option>
                        <option value="ADMISSIONS">Admissions team</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Broadcast Message</label>
                    <textarea {...register('message', { required: true })} rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" placeholder="Write your announcement..." />
                </div>
                <button
                    type="submit"
                    className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-all hover:bg-violet-700"
                >
                    Send
                </button>
            </form>
        </Modal>
    );
};

export default BroadcastModal;
