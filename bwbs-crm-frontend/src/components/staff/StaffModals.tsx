import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createUser, updateUser, type UserListItem } from '../../services/users';
import { getBranches } from '../../services/branches';
import { X, Loader2, ShieldCheck, Mail, Phone, User as UserIcon, Building2 } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff?: UserListItem; // If provided, we are in Edit/Update mode
    initialBranchId?: string;
}

export const StaffManagementModal = ({ isOpen, onClose, staff, initialBranchId }: ModalProps) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        role: 'COUNSELOR',
        branch: initialBranchId || '',
    });

    const { data: branches } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                first_name: staff.first_name,
                last_name: staff.last_name,
                email: staff.email,
                phone: (staff as any).phone || '',
                username: (staff as any).username || staff.email.split('@')[0],
                password: '', // Never set password in edit mode unless requested
                role: staff.role,
                branch: staff.branch || '',
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                username: '',
                password: '',
                role: 'COUNSELOR',
                branch: initialBranchId || '',
            });
        }
    }, [staff, isOpen, initialBranchId]);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (staff) {
                // For update, exclude sensitive fields if empty
                const { password, username, email, ...updatePayload } = data;
                return updateUser(staff.id, updatePayload);
            }
            return createUser(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    const roles = [
        { id: 'COUNSELOR', name: 'Counselor', icon: UserIcon },
        { id: 'DOC_PROCESSOR', name: 'Doc Processor', icon: ShieldCheck },
        { id: 'BRANCH_MANAGER', name: 'Branch Manager', icon: Building2 },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Visual Header */}
                <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-6 left-10 w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center border border-slate-50">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-[#AD03DE]" />
                        </div>
                    </div>
                </div>

                <div className="p-10 pt-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
                            {staff ? 'Operational Redeployment' : 'Elite Talent Recruitment'}
                        </h2>
                        <p className="text-[10px] font-black text-[#AD03DE] uppercase tracking-[0.3em] mt-1">
                            {staff ? `Modifying Profile: ${staff.first_name} ${staff.last_name}` : 'Scaling Branch Performance Units'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Professional Name</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                            placeholder="First"
                                            required
                                        />
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                            placeholder="Last"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Communication Hub</label>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                disabled={!!staff}
                                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none disabled:opacity-50"
                                                placeholder="Professional Email"
                                                required
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 placeholder:text-slate-300 transition-all outline-none"
                                                placeholder="Contact Number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role & Deployment */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Asset Deployment</label>
                                    <select
                                        value={formData.branch}
                                        onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select Target Branch</option>
                                        {branches?.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Operational Role</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {roles.map(role => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={clsx(
                                                    "px-5 py-4 rounded-2xl border text-left transition-all relative flex items-center gap-4 group/role",
                                                    formData.role === role.id
                                                        ? "bg-[#AD03DE]/5 border-[#AD03DE] shadow-inner"
                                                        : "bg-white border-slate-100 hover:border-slate-200"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                    formData.role === role.id ? "bg-[#AD03DE] text-white" : "bg-slate-50 text-slate-400 group-hover/role:bg-slate-100"
                                                )}>
                                                    <role.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={clsx("text-sm font-bold", formData.role === role.id ? "text-slate-900" : "text-slate-600")}>{role.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Deployment</p>
                                                </div>
                                                {formData.role === role.id && (
                                                    <div className="absolute right-5 w-2 h-2 rounded-full bg-[#AD03DE] animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!staff && (
                            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100/50 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Temporary Access Code</p>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-amber-900 focus:ring-0 placeholder:text-amber-300"
                                        placeholder="Enter Initial Password"
                                        required={!staff}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-mono"
                            >
                                Cancel Operation
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:bg-[#AD03DE] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 font-mono"
                            >
                                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                {staff ? 'Commit Redeployment' : 'Activate Recruitment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
