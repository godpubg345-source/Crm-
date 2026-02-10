import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createFixedAsset } from '../../../services/branches';
import Modal from '../components/Modal';
import type { ModalProps } from '../types';

const AddAssetModal = ({ isOpen, onClose, branchId }: ModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm();

    const assetMutation = useMutation({
        mutationFn: (data: any) => createFixedAsset({ ...data, branch: branchId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-assets', branchId] });
            reset();
            onClose();
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New Asset">
            <form onSubmit={handleSubmit((data) => assetMutation.mutate(data))} className="space-y-6">
                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-[#AD03DE] focus-within:ring-4 focus-within:ring-[#AD03DE]/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#AD03DE] transition-colors mb-1">Asset Name</label>
                    <input {...register('name', { required: true })} className="w-full bg-transparent text-lg font-serif font-bold text-slate-900 outline-none placeholder:text-slate-300" placeholder="e.g. MacBook Pro M3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-[#AD03DE] focus-within:ring-4 focus-within:ring-[#AD03DE]/10 transition-all duration-300">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#AD03DE] transition-colors mb-1">Category</label>
                        <select {...register('category', { required: true })} className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none">
                            <option value="IT_EQUIPMENT">Electronics / IT</option>
                            <option value="FURNITURE">Furniture</option>
                            <option value="VEHICLE">Fleet / Vehicle</option>
                            <option value="OFFICE_SUPPLY">Office Supply</option>
                        </select>
                    </div>

                    <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-[#AD03DE] focus-within:ring-4 focus-within:ring-[#AD03DE]/10 transition-all duration-300">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#AD03DE] transition-colors mb-1">Value (GBP)</label>
                        <input {...register('purchase_value', { required: true })} type="number" className="w-full bg-transparent text-lg font-serif font-bold text-slate-900 outline-none placeholder:text-slate-300" placeholder="0.00" />
                    </div>
                </div>

                <div className="group rounded-2xl bg-slate-50 p-4 border border-slate-100 focus-within:border-[#AD03DE] focus-within:ring-4 focus-within:ring-[#AD03DE]/10 transition-all duration-300">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-[#AD03DE] transition-colors mb-1">Asset Tag / ID</label>
                    <input {...register('asset_tag')} className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300" placeholder="Optional barcode scan" />
                </div>

                <button
                    type="submit"
                    disabled={assetMutation.isPending}
                    className="w-full py-5 bg-[#AD03DE] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#AD03DE]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                >
                    {assetMutation.isPending ? 'Syncing to Inventory...' : 'Add to Digital Inventory'}
                </button>
            </form>
        </Modal>
    );
};

export default AddAssetModal;
