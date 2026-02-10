import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { getUsers, getUserStats, type UserListItem } from '../services/users';
import { getBranches } from '../services/branches';
import {
    Search,
    Plus,
    MoreVertical,
    ShieldCheck,
    Building2,
    Mail,
    Trophy,
    ArrowUpRight,
    ArrowLeft,
    Loader2,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaffManagementModal } from '../components/staff/StaffModals';
import { StaffDossier } from '../components/staff/StaffDossier';

const StaffManagement = () => {
    const [searchParams] = useSearchParams();
    const branchParam = searchParams.get('branch');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>(branchParam || 'all');
    const [selectedRole, setSelectedRole] = useState<string>('all');

    // Management Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<UserListItem | undefined>(undefined);
    const [dossierStaff, setDossierStaff] = useState<UserListItem | null>(null);

    // Debounce Logic for Professional Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (branchParam) {
            setSelectedBranch(branchParam);
        }
    }, [branchParam]);

    const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
        queryKey: ['staff-directory'],
        queryFn: () => getUsers(),
    });

    const { data: branches = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });

    const filteredStaff = staff.filter(member => {
        const matchesSearch =
            member.first_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            member.last_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            member.email.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesBranch = selectedBranch === 'all' || member.branch === selectedBranch;
        const matchesRole = selectedRole === 'all' || member.role === selectedRole;
        return matchesSearch && matchesBranch && matchesRole;
    });

    const handleRecruit = () => {
        setSelectedStaff(undefined);
        setIsModalOpen(true);
    };

    const handleUpdateStaff = (staff: UserListItem) => {
        setSelectedStaff(staff);
        setIsModalOpen(true);
    };

    const handleViewDossier = (staff: UserListItem) => {
        setDossierStaff(staff);
        setIsDossierOpen(true);
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 pb-32">
            <StaffManagementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staff={selectedStaff}
                initialBranchId={selectedBranch !== 'all' ? selectedBranch : undefined}
            />

            <StaffDossier
                isOpen={isDossierOpen}
                onClose={() => setIsDossierOpen(false)}
                staff={dossierStaff}
            />

            {/* Command Header */}
            <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-6">
                    <Link
                        to="/branches"
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-[#AD03DE] transition-all group w-fit"
                    >
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#AD03DE]/5 transition-colors">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Back to Command Center
                    </Link>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="w-2.5 h-12 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_20px_rgba(173,3,222,0.4)]" />
                        <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-none uppercase">
                            Team <span className="text-[#AD03DE]">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-sm font-serif font-bold text-slate-400 max-w-md">
                        Institutional personnel management. Deploy staff, monitor performance tiers, and manage the global workforce hub.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify Operative..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-800 placeholder:text-slate-300 w-48 uppercase tracking-[0.2em]"
                        />
                    </div>
                    <button
                        onClick={handleRecruit}
                        className="px-10 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <Plus className="w-5 h-5 text-emerald-400 group-hover:rotate-90 transition-transform duration-700" />
                        Recruit Staff
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-12">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-[2rem] border border-white">
                    <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="text-[10px] font-bold text-slate-600 bg-transparent border-none outline-none uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">Global Network</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="text-[10px] font-bold text-slate-600 bg-transparent border-none outline-none uppercase tracking-widest cursor-pointer"
                        >
                            <option value="all">All Rankings</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="BRANCH_MANAGER">Branch Manager</option>
                            <option value="COUNSELOR">Counselor</option>
                            <option value="DOC_PROCESSOR">Doc Processor</option>
                        </select>
                    </div>

                    <div className="ml-auto px-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-[#AD03DE]">{filteredStaff.length}</span> Active Operatives
                        </p>
                    </div>
                </div>

                {/* Staff Grid */}
                {isLoadingStaff ? (
                    <div className="py-32 flex flex-col items-center gap-6">
                        <Loader2 className="w-12 h-12 animate-spin text-[#AD03DE]" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Querying Workforce Ledger</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center bg-white/50 rounded-[4rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">No Intelligence Found</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjust filters to identify operatives</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredStaff.map((member, idx) => (
                                <StaffCard
                                    key={member.id}
                                    member={member}
                                    idx={idx}
                                    onUpdate={() => handleUpdateStaff(member)}
                                    onView={() => handleViewDossier(member)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

const StaffCard = ({ member, idx, onUpdate, onView }: { member: UserListItem, idx: number, onUpdate: () => void, onView: () => void }) => {
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['staff-stats', member.id],
        queryFn: () => getUserStats(member.id),
        enabled: !!member.id,
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={onView}
            className="group bg-white p-10 rounded-[3.5rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-2xl transition-all duration-700 relative overflow-hidden cursor-pointer"
        >
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full translate-x-12 -translate-y-12 transition-colors duration-700 group-hover:bg-[#AD03DE]/5" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-serif font-black text-4xl shadow-2xl shadow-slate-200 group-hover:rotate-6 transition-transform duration-700">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tighter leading-none">
                                    {member.first_name} {member.last_name}
                                </h3>
                                {member.role === 'SUPER_ADMIN' && <ShieldCheck className="w-5 h-5 text-[#AD03DE]" />}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{member.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate();
                        }}
                        className="p-3 text-slate-200 hover:text-[#AD03DE] transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-8 pb-8 border-b border-slate-50">
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <Mail className="w-4 h-4" />
                        <span className="text-[11px] font-medium leading-none">{member.email}</span>
                    </div>
                </div>

                {/* Forensic Intelligence Section */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-[#AD03DE]/10 transition-all">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion</p>
                        {isLoadingStats ? (
                            <div className="h-6 w-12 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-xl font-serif font-black text-slate-900 leading-none">
                                {stats?.conversion_rate || 0}%
                            </p>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-[#AD03DE]/10 transition-all">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployments</p>
                        {isLoadingStats ? (
                            <div className="h-6 w-8 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-xl font-serif font-black text-slate-900 leading-none">
                                {stats?.enrolled_leads || 0}
                            </p>
                        )}
                    </div>
                </div>

                {/* Performance Tier & Action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#AD03DE]/5 flex items-center justify-center text-[#AD03DE]">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[14px] font-serif font-black text-slate-900 leading-none mb-1">
                                Tier {member.performance?.level || 1}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                {member.performance?.points || 0} Intel XP
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView();
                        }}
                        className="px-6 py-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#AD03DE] hover:bg-[#AD03DE]/5 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group/btn"
                    >
                        Dossier
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default StaffManagement;
