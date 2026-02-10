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
        <Modal isOpen={isOpen} onClose={onClose} title="Regional Broadcast">
            <form onSubmit={handleSubmit(handleBroadcast)} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Target Audience</label>
                    <select {...register('audience')} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none">
                        <option value="ALL">All Branch Personnel</option>
                        <option value="COUNSELORS">Counselors Only</option>
                        <option value="ADMISSIONS">Admissions Team</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Broadcast Message</label>
                    <textarea {...register('message', { required: true })} rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none" placeholder="Enter high-priority announcement..." />
                </div>
                <button
                    type="submit"
                    className="w-full py-5 bg-[#AD03DE] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                    Initiate Broadcast
                </button>
            </form>
        </Modal>
    );
};

export default BroadcastModal;
