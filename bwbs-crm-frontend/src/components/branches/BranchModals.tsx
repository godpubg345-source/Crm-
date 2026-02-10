import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBranch, updateBranch, type Branch } from '../../services/branches';
import { X, Loader2 } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    branch?: Branch; // If provided, we are in Edit mode
}

export const BranchModal = ({ isOpen, onClose, branch }: ModalProps) => {
    const minCountryList = ['United Kingdom', 'Pakistan', 'UAE', 'USA', 'Canada', 'Australia'];
    const minCurrencyList = ['GBP', 'PKR', 'AED', 'USD', 'CAD', 'AUD'];

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        country: 'United Kingdom',
        currency: 'GBP',
        city: '',
        timezone: 'UTC',
        latitude: '',
        longitude: '',
        is_hq: false,
        opening_time: '09:00',
        closing_time: '18:00',
        auto_handoff_enabled: false,
    });

    useEffect(() => {
        const updateForm = () => {
            if (branch) {
                setFormData({
                    name: branch.name,
                    code: branch.code,
                    country: branch.country,
                    currency: branch.currency,
                    city: branch.address?.split(',')[0] || '',
                    timezone: branch.timezone || 'UTC',
                    latitude: branch.latitude !== undefined && branch.latitude !== null ? String(branch.latitude) : '',
                    longitude: branch.longitude !== undefined && branch.longitude !== null ? String(branch.longitude) : '',
                    is_hq: branch.is_hq,
                    opening_time: branch.opening_time?.substring(0, 5) || '09:00',
                    closing_time: branch.closing_time?.substring(0, 5) || '18:00',
                    auto_handoff_enabled: branch.auto_handoff_enabled,
                });
            } else {
                setFormData({
                    name: '',
                    code: '',
                    country: 'United Kingdom',
                    currency: 'GBP',
                    city: '',
                    timezone: 'UTC',
                    latitude: '',
                    longitude: '',
                    is_hq: false,
                    opening_time: '09:00',
                    closing_time: '18:00',
                    auto_handoff_enabled: false,
                });
            }
        };
        // Use microtask to avoid "setState synchronously within effect" warning
        window.queueMicrotask(updateForm);
    }, [branch, isOpen]);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const { city, latitude, longitude, ...rest } = data;
            const payload: any = {
                ...rest,
                address: city // Mapping city to address for simplicity
            };
            payload.timezone = payload.timezone || 'UTC';
            payload.latitude = latitude === '' ? null : Number(latitude);
            payload.longitude = longitude === '' ? null : Number(longitude);
            if (branch) {
                return updateBranch(branch.id, payload);
            }
            return createBranch(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">
                    {branch ? 'Edit Branch' : 'New Branch'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                    {branch ? 'Modify Operational Details' : 'Expand Global Network'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                placeholder="e.g. Lahore Headquarters"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                    placeholder="e.g. LHR"
                                    maxLength={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                    placeholder="e.g. Lahore"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                                <select
                                    value={formData.country}
                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none cursor-pointer appearance-none"
                                >
                                    {minCountryList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none cursor-pointer appearance-none"
                                >
                                    {minCurrencyList.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timezone</label>
                            <input
                                type="text"
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                placeholder="e.g. Asia/Karachi"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Latitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={formData.latitude}
                                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                    placeholder="e.g. 31.5204"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Longitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={formData.longitude}
                                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                    placeholder="e.g. 74.3587"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Opening Time</label>
                                <input
                                    type="time"
                                    value={formData.opening_time}
                                    onChange={e => setFormData({ ...formData, opening_time: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Closing Time</label>
                                <input
                                    type="time"
                                    value={formData.closing_time}
                                    onChange={e => setFormData({ ...formData, closing_time: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, is_hq: !formData.is_hq })}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.is_hq ? 'bg-[#AD03DE] border-[#AD03DE]' : 'border-slate-300 bg-white'}`}>
                                {formData.is_hq && <Loader2 className="w-3 h-3 text-white animate-none" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Mark as Headquarters</p>
                                <p className="text-[10px] text-slate-400">Primary operational center</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, auto_handoff_enabled: !formData.auto_handoff_enabled })}>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.auto_handoff_enabled ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                                {formData.auto_handoff_enabled && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Enable Auto-Handoff</p>
                                <p className="text-[10px] text-slate-400">Transfer tasks automatically after hours</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {mutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            {branch ? 'Save Changes' : 'Create Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
