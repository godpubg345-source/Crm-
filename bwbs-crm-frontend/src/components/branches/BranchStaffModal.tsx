import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBranchStaff, assignBranchStaff, type Branch } from '../../services/branches';
import { getUsers } from '../../services/users';
import { X, UserPlus, XCircle, Search, Users, Loader2, CheckCircle2 } from 'lucide-react';

interface BranchStaffModalProps {
    branch: Branch;
    onClose: () => void;
}

const BranchStaffModal = ({ branch, onClose }: BranchStaffModalProps) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
        queryKey: ['branch-staff', branch.id],
        queryFn: () => getBranchStaff(branch.id),
    });

    const { data: allUsers = [], isLoading: isLoadingAll } = useQuery({
        queryKey: ['all-users'],
        queryFn: () => getUsers(),
        enabled: isAssigning,
    });

    const assignMutation = useMutation({
        mutationFn: (userIds: string[]) => assignBranchStaff(branch.id, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branch-staff', branch.id] });
            setIsAssigning(false);
        }
    });

    const unassignedUsers = allUsers.filter(u => u.branch !== branch.id);
    const filteredUsers = unassignedUsers.filter(u =>
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-sm p-6 relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{branch.name} Personnel</h2>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 opacity-60">Branch staff</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 premium-scrollbar">
                    {isAssigning ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-[#7c3aed]" />
                                    Add staff
                                </h3>
                                <button
                                    onClick={() => setIsAssigning(false)}
                                    className="text-xs text-slate-500 hover:text-rose-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 group focus-within:ring-4 focus-within:ring-[#7c3aed]/10 transition-all">
                                <Search className="w-4 h-4 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="Search staff..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300 w-full"
                                />
                            </div>

                            <div className="space-y-3">
                                {isLoadingAll ? (
                                    <div className="flex justify-center py-6"><Loader2 className="w-8 h-8 animate-spin text-slate-200" /></div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                        <p className="text-sm font-bold text-slate-400">No staff available to add.</p>
                                    </div>
                                ) : filteredUsers.map(user => (
                                    <div key={user.id} className="p-5 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-[#7c3aed]/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-semibold">{user.first_name?.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs font-bold text-[#7c3aed]">{user.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => assignMutation.mutate([user.id])}
                                            disabled={assignMutation.isPending}
                                            className="px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all"
                                        >
                                            {assignMutation.isPending ? 'Assigning...' : 'Deploy'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#7c3aed]" />
                                    Active ({staff.length})
                                </h3>
                                <button
                                    onClick={() => setIsAssigning(true)}
                                    className="px-4 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 hover:bg-violet-700"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Staff
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {isLoadingStaff ? (
                                    <div className="flex justify-center py-6"><Loader2 className="w-8 h-8 animate-spin text-slate-200" /></div>
                                ) : staff.length === 0 ? (
                                    <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                        <p className="text-sm font-bold text-slate-400">No staff in this branch yet.</p>
                                    </div>
                                ) : staff.map((member: any) => (
                                    <div key={member.id} className="p-6 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-[#7c3aed] transition-all duration-200 text-xl font-semibold">
                                                    {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold text-slate-900">{member.first_name} {member.last_name}</h4>
                                                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-2">
                                                                <CheckCircle2 className="w-2 h-2" />
                                                                Active
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-slate-500">{member.role_display}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="text-xs text-slate-500">{member.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-8 border-t border-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-all shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchStaffModal;
