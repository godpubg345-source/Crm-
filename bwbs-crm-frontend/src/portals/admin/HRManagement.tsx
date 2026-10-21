import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAttendanceLogs,
    getLeaveRequests,
    approveLeave,
    rejectLeave,
    getUsers,
    getCounselors,
    updateSpecialties,
    getUserStats,
    type UserListItem,
} from '../../services/users';
import { getBranches } from '../../services/branches';
import {
    Clock,
    CalendarOff,
    CheckCircle2,
    XCircle,
    Loader2,
    User,
    Download,
    Filter,
    Globe,
    Target,
    BadgeDollarSign,
    Users,
    Search,
    Plus,
    MoreVertical,
    ShieldCheck,
    Building2,
    Mail,
    Trophy,
    ArrowUpRight,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { StaffManagementModal } from '../../components/staff/StaffModals';
type Tab = 'directory' | 'attendance' | 'leaves' | 'specialties';

const HRManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('directory');

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'directory', label: 'Counselors', icon: Users },
        { key: 'leaves', label: 'Leave Requests', icon: CalendarOff },
        { key: 'attendance', label: 'Attendance', icon: Clock },
        { key: 'specialties', label: 'Counselor Specialties', icon: Globe },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Staff</h1>
                    <p className="text-slate-500 font-medium">Staff accounts, attendance, leave and lead routing.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-xl p-1.5 border border-slate-200 w-fit overflow-x-auto max-w-full">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={clsx(
                                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.key
                                    ? "bg-[#7c3aed] text-white shadow-sm "
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'leaves' && <LeaveApprovalsTab />}
            {activeTab === 'attendance' && <AttendanceTab />}
            {activeTab === 'directory' && <StaffDirectoryTab />}
            {activeTab === 'specialties' && <SpecialtiesTab />}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// LEAVE APPROVALS TAB
// ──────────────────────────────────────────────────────────────────
const LeaveApprovalsTab: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['allLeaves'],
        queryFn: () => getLeaveRequests(),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => approveLeave(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allLeaves'] }),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => rejectLeave(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allLeaves'] }),
    });

    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" /></div>;
    }

    const pending = leaves?.filter((l: any) => l.status === 'PENDING') || [];
    const processed = leaves?.filter((l: any) => l.status !== 'PENDING') || [];

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            {pending.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-4 pl-1">
                        Pending Approval ({pending.length})
                    </h3>
                    <div className="space-y-4">
                        {pending.map((leave: any) => (
                            <div key={leave.id} className="bg-white rounded-2xl border-2 border-amber-100 p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{leave.user_name || leave.user_email || 'Employee'}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                                                    {leave.leave_type_display || leave.leave_type}
                                                </span>
                                                <span>{format(parseISO(leave.start_date), 'MMM dd')} — {format(parseISO(leave.end_date), 'MMM dd, yyyy')}</span>
                                                <span className="font-semibold text-slate-900">{leave.total_days} days</span>
                                            </div>
                                            {leave.reason && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{leave.reason}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => approveMutation.mutate(leave.id)}
                                            disabled={approveMutation.isPending}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectMutation.mutate(leave.id)}
                                            disabled={rejectMutation.isPending}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 border-2 border-rose-200 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-all disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pending.length === 0 && (
                <div className="text-center py-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900">All Clear</h3>
                    <p className="text-sm text-slate-500 font-medium">No pending leave requests.</p>
                </div>
            )}

            {/* Processed History */}
            {processed.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-4 pl-1">History</h3>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee</th>
                                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Dates</th>
                                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Days</th>
                                    <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {processed.slice(0, 15).map((leave: any) => (
                                    <tr key={leave.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="p-5 font-bold text-slate-900">{leave.user_name || leave.user_email || 'Employee'}</td>
                                        <td className="p-5 text-slate-500 font-medium">{leave.leave_type_display || leave.leave_type}</td>
                                        <td className="p-5 text-slate-500 font-medium">
                                            {format(parseISO(leave.start_date), 'MMM dd')} — {format(parseISO(leave.end_date), 'MMM dd')}
                                        </td>
                                        <td className="p-5 font-semibold text-slate-900">{leave.total_days}</td>
                                        <td className="p-5">
                                            <span className={clsx(
                                                "px-2.5 py-1 text-xs font-semibold rounded-lg",
                                                leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-rose-100 text-rose-700'
                                            )}>
                                                {leave.status_display || leave.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// ATTENDANCE TAB
// ──────────────────────────────────────────────────────────────────
const AttendanceTab: React.FC = () => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['allAttendance'],
        queryFn: () => getAttendanceLogs(),
    });

    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" /></div>;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = logs?.filter((l: any) => l.date === todayStr) || [];
    const present = todayLogs.filter((l: any) => l.clock_in).length;

    return (
        <div className="space-y-6">
            {/* Today Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs font-semibold text-purple-300 mb-2">Today's Attendance</p>
                        <h2 className="text-3xl font-semibold">{present}</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">employees present</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Clocked In</p>
                    <h2 className="text-3xl font-semibold text-emerald-600">
                        {todayLogs.filter((l: any) => l.clock_in && !l.clock_out).length}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">active now</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Completed Shift</p>
                    <h2 className="text-3xl font-semibold text-slate-900">
                        {todayLogs.filter((l: any) => l.clock_in && l.clock_out).length}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-1">checked out</p>
                </div>
            </div>

            {/* Full Log Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">Recent Attendance Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee</th>
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Clock In</th>
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Clock Out</th>
                                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Hours</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {logs?.slice(0, 20).map((log: any) => (
                                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5 font-bold text-slate-900">{log.user_name || log.user_email || 'Employee'}</td>
                                    <td className="p-5 text-slate-500 font-medium">{format(parseISO(log.date), 'MMM dd, yyyy')}</td>
                                    <td className="p-5">
                                        <span className={clsx(
                                            "px-2.5 py-1 text-xs font-semibold rounded-lg",
                                            log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                                log.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' :
                                                    log.status === 'ON_LEAVE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                        )}>
                                            {(log.status || 'UNKNOWN').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-500 font-medium">
                                        {log.clock_in ? format(parseISO(log.clock_in), 'HH:mm') : '--:--'}
                                    </td>
                                    <td className="p-5 text-slate-500 font-medium">
                                        {log.clock_out ? format(parseISO(log.clock_out), 'HH:mm') : '--:--'}
                                    </td>
                                    <td className="p-5 text-right font-semibold text-slate-900">{log.total_hours || '0.00'}</td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">No attendance records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────
// STAFF DIRECTORY TAB
// ──────────────────────────────────────────────────────────────────
const StaffDirectoryTab: React.FC = () => {
    const [searchParams] = useSearchParams();
    const branchParam = searchParams.get('branch');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<string>(branchParam || 'all');
    const [selectedRole, setSelectedRole] = useState<string>('all');

    // Management Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<UserListItem | undefined>(undefined);
    const navigate = useNavigate();

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
        navigate(`/admin/team/staff/${staff.id}`);
    };

    return (
        <div className="space-y-6">
            <StaffManagementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staff={selectedStaff}
                initialBranchId={selectedBranch !== 'all' ? selectedBranch : undefined}
            />

            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Staff Directory</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage staff accounts and access profiles.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-[#7c3aed]/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#7c3aed]" />
                        <input
                            type="text"
                            placeholder="Search Staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-300 w-32"
                        />
                    </div>
                    <button
                        onClick={handleRecruit}
                        className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Add Staff
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-white">
                    <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none cursor-pointer"
                        >
                            <option value="all">All Locations</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-slate-200">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="text-xs font-bold text-slate-600 bg-transparent border-none outline-none cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="BRANCH_MANAGER">Branch Manager</option>
                            <option value="COUNSELOR">Counselor</option>
                            <option value="DOC_PROCESSOR">Doc Processor</option>
                        </select>
                    </div>

                    <div className="ml-auto px-6">
                        <p className="text-xs text-slate-500">
                            Showing <span className="text-[#7c3aed]">{filteredStaff.length}</span> Active Staff
                        </p>
                    </div>
                </div>

                {/* Staff Grid */}
                {isLoadingStaff ? (
                    <div className="py-12 flex flex-col items-center gap-6">
                        <Loader2 className="w-12 h-12 animate-spin text-[#7c3aed]" />
                        <p className="text-xs text-slate-500">Loading Staff Directory</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">No Staff Found</h3>
                        <p className="text-xs text-slate-500">Adjust filters to find staff members</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
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
            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-[#7c3aed]/20 transition-all duration-200 relative overflow-hidden cursor-pointer"
        >
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full translate-x-12 -translate-y-12 transition-colors duration-200 group-hover:bg-[#7c3aed]/5" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-semibold text-3xl shadow-sm transition-transform duration-200">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">
                                    {member.first_name} {member.last_name}
                                </h3>
                                {member.role === 'SUPER_ADMIN' && <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />}
                            </div>
                            <p className="text-xs font-semibold text-slate-400">{member.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate();
                        }}
                        className="p-3 text-slate-200 hover:text-[#7c3aed] transition-colors"
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

                {/* Staff profile Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-[#7c3aed]/10 transition-all">
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Conversion Rate</p>
                        {isLoadingStats ? (
                            <div className="h-6 w-12 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-xl font-semibold text-slate-900 leading-none">
                                {stats?.conversion_rate || 0}%
                            </p>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 group-hover:bg-white group-hover:border-[#7c3aed]/10 transition-all">
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Enrollments</p>
                        {isLoadingStats ? (
                            <div className="h-6 w-8 bg-slate-100 animate-pulse rounded" />
                        ) : (
                            <p className="text-xl font-semibold text-slate-900 leading-none">
                                {stats?.enrolled_leads || 0}
                            </p>
                        )}
                    </div>
                </div>

                {/* Performance Tier & Action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/5 flex items-center justify-center text-[#7c3aed]">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-slate-900 leading-none mb-1">
                                Tier {member.performance?.level || 1}
                            </p>
                            <p className="text-[11px] text-slate-500 tracking-tight">
                                {member.performance?.points || 0} Points
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView();
                        }}
                        className="px-6 py-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#7c3aed] hover:bg-[#7c3aed]/5 transition-all font-semibold text-xs flex items-center gap-2 group/btn"
                    >
                        Profile
                        <ArrowUpRight className="w-4 h-4 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};



// ──────────────────────────────────────────────────────────────────
// SPECIALTIES TAB (ROUTING MAP)
// ──────────────────────────────────────────────────────────────────
const SpecialtiesTab: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: staff, isLoading } = useQuery({
        queryKey: ['allCounselors'],
        queryFn: () => getCounselors(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ userId, specs }: { userId: string; specs: string[] }) => updateSpecialties(userId, specs),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allCounselors'] });
        },
    });

    const availableCountries = ['Pakistan', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Turkey', 'UAE'];

    const toggleSpecialty = (user: any, country: string) => {
        const currentSpecs = user.dossier?.specialties || [];
        const newSpecs = currentSpecs.includes(country)
            ? currentSpecs.filter((s: string) => s !== country)
            : [...currentSpecs, country];

        updateMutation.mutate({ userId: user.id, specs: newSpecs });
    };

    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" /></div>;
    }

    const filteredStaff = staff?.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Lead routing</h2>
                        <p className="text-sm text-slate-500 font-medium">Choose which counselor gets leads for each country.</p>
                    </div>
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#7c3aed] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find counselor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3.5 bg-slate-50 rounded-2xl border-none text-sm font-semibold focus:ring-2 focus:ring-[#7c3aed] outline-none min-w-[300px]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredStaff.map((user: any) => (
                        <div key={user.id} className="bg-slate-50/50 rounded-2xl p-6 border border-white hover:bg-white hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#7c3aed] font-semibold transition-all border border-slate-200">
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{user.first_name} {user.last_name}</h3>
                                        <p className="text-xs font-semibold text-slate-400">{user.branch_details?.name || 'HQ Operational'}</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] font-semibold text-slate-400">Assigned Territories</p>
                                <div className="flex flex-wrap gap-2">
                                    {availableCountries.map(country => {
                                        const isActive = user.dossier?.specialties?.includes(country);
                                        return (
                                            <button
                                                key={country}
                                                onClick={() => toggleSpecialty(user, country)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all border-2",
                                                    isActive
                                                        ? "bg-[#7c3aed] text-white border-[#7c3aed] shadow-sm "
                                                        : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                                                )}
                                            >
                                                {country}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredStaff.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 text-xs">No counselors match your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Intel */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[#7c3aed] border border-white/5">
                        <Target className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold tracking-tight">Auto-assign</h3>
                        <p className="text-slate-400 text-sm font-medium max-w-2xl mt-2">
                            The Lead Importer module uses these specialties to automatically designate leads to the most qualified operatives.
                            Matching student nationality to counselor specialty increases conversion velocity by <span className="text-white font-semibold underline decoration-[#7c3aed] underline-offset-4">42% on average.</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRManagement;
