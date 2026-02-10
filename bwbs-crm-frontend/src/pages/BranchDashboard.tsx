import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBranches, getBranchAnalytics, getPredictiveStaffing, getBranchOperationalStatus, type Branch } from '../services/branches';
import { BranchModal } from '../components/branches/BranchModals';
import GlobalNetworkGlobe from '../components/branches/GlobalNetworkGlobe';
import TransferRequestModal from '../components/branches/TransferRequestModal';
import HandoffSuggestionsPanel from '../components/branches/HandoffSuggestionsPanel';
import EmployeeArena from './EmployeeArena';
import Leaderboard from './Leaderboard';
import {
    Building2,
    MapPin,
    Globe,
    Plus,
    Edit3,
    Search,
    Loader2,
    ShieldCheck,
    Users,
    TrendingUp,
    Zap,
    ArrowRightLeft,
    Sun,
    Moon,
    Clock,
    LayoutGrid,
    Trophy
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// BRANCH DASHBOARD - GLOBAL OPERATIONS COMMAND
// ============================================================================

const AnalyticsItem = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
    <div className="space-y-2 group/item">
        <p className="text-[9px] text-slate-300 uppercase tracking-widest font-bold flex items-center gap-2">
            <Icon className={clsx("w-2.5 h-2.5", color)} />
            {label}
        </p>
        <p className="text-2xl font-serif font-black text-slate-900 tracking-tight group-hover/item:translate-x-1 transition-transform">{value}</p>
    </div>
);

const BranchCard = ({ branch, onEdit, onManageStaff, onHandoff }: {
    branch: Branch,
    onEdit: (b: Branch) => void,
    onManageStaff: (b: Branch) => void,
    onHandoff: (b: Branch) => void
}) => {
    const [currentTime, setCurrentTime] = useState(branch.local_time || '--:--');

    useEffect(() => {
        setCurrentTime(branch.local_time || '--:--');
    }, [branch.local_time]);

    useEffect(() => {
        const timer = setInterval(() => {
            try {
                // Approximate local time ticking
                const [hours, minutes] = currentTime.split(':').map(Number);
                if (isNaN(hours)) return;

                let newMinutes = minutes + 1;
                let newHours = hours;
                if (newMinutes >= 60) {
                    newMinutes = 0;
                    newHours = (hours + 1) % 24;
                }
                setCurrentTime(`${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`);
            } catch (e) {
                // Stick to initial if parsing fails
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [currentTime]);

    const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
        queryKey: ['branch-analytics', branch.id],
        queryFn: () => getBranchAnalytics(branch.id),
        staleTime: 60000,
    });

    const { data: predictive } = useQuery({
        queryKey: ['branch-predictive', branch.id],
        queryFn: () => getPredictiveStaffing(branch.id),
        staleTime: 300000, // 5 minutes
    });

    return (
        <div
            className="group bg-white p-10 rounded-[3.5rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-1000 relative overflow-hidden flex flex-col min-h-[500px]"
        >
            {/* Status Glow */}
            <div className={clsx(
                "absolute top-0 right-0 w-64 h-64 rounded-full translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 blur-[100px]",
                branch.is_currently_open ? "bg-emerald-500/10 group-hover:bg-[#AD03DE]/5" : "bg-slate-100 group-hover:bg-slate-200"
            )} />

            <div className="relative z-10 flex-1">
                {/* Branch Node Status */}
                <div className="flex items-center justify-between mb-8">
                    <div className={clsx(
                        "px-4 py-1.5 rounded-xl border flex items-center gap-2 animate-in fade-in duration-1000",
                        branch.is_currently_open
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                    )}>
                        {branch.is_currently_open ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {branch.is_currently_open ? 'Node Active' : 'Offline'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-current animate-pulse ml-1" />
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-slate-100">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold">{currentTime}</span>
                    </div>
                </div>

                {/* Card Header */}
                <div className="flex items-start justify-between mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#AD03DE] group-hover:bg-white group-hover:shadow-2xl group-hover:rotate-6 transition-all duration-700">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-3">
                        {branch.is_hq && (
                            <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 animate-in zoom-in duration-700">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    HQ Command
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => onEdit(branch)}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-[#AD03DE] hover:border-[#AD03DE]/20 transition-all active:scale-90"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Center Info */}
                <div
                    onClick={() => onManageStaff(branch)}
                    className="mb-12 group-hover:translate-x-2 transition-transform duration-700 cursor-pointer"
                >
                    <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-4xl font-serif font-black text-slate-900 tracking-tighter leading-none hover:text-[#AD03DE] transition-colors">{branch.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-3 py-1 rounded-lg border border-[#AD03DE]/10 shadow-inner group-hover:scale-110 transition-transform">
                            {branch.code}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{branch.country} Territory</span>
                    </div>
                </div>

                {/* Logistics & Intelligence Grid */}
                <div className="grid grid-cols-2 gap-y-10 gap-x-8 pt-10 border-t border-slate-50 relative">
                    {isLoadingAnalytics ? (
                        <div className="col-span-2 flex justify-center py-10 opacity-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <AnalyticsItem label="Total Leads" value={analytics?.total_leads || 0} icon={Zap} color="text-amber-500" />
                            <AnalyticsItem label="Win Rate" value={`${analytics?.conversion_rate || 0}%`} icon={TrendingUp} color="text-[#AD03DE]" />
                            <AnalyticsItem label="Enrolments" value={analytics?.active_students || 0} icon={ShieldCheck} color="text-emerald-500" />
                            <AnalyticsItem label="Currency" value={branch.currency} icon={Globe} color="text-indigo-500" />
                        </>
                    )}
                </div>

                {/* Predictive Intelligence Widget */}
                <div className="mt-8 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intelligence Forecast</span>
                    </div>
                    {predictive ? (
                        <div className={clsx(
                            "p-5 rounded-2xl border transition-all duration-700",
                            predictive.status === 'CRITICAL' ? "bg-rose-50 border-rose-100 text-rose-600 shadow-lg shadow-rose-200/20" :
                                predictive.status === 'WARNING' ? "bg-amber-50 border-amber-100 text-amber-600 shadow-lg shadow-amber-200/20" :
                                    "bg-emerald-50 border-emerald-100 text-emerald-600"
                        )}>
                            <p className="text-[11px] font-bold leading-relaxed mb-3">{predictive.recommendation}</p>
                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                                <span className="flex items-center gap-1.5"><Users className="w-2 h-2" /> Load: {predictive.leads_per_staff_monthly} L/S</span>
                                <span className="flex items-center gap-1.5"><TrendingUp className="w-2 h-2" /> Forecast: +{predictive.projected_load_14d}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-20 flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            Calculating Capacity...
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col gap-4 relative z-10">
                {!branch.is_currently_open && (
                    <button
                        onClick={() => onHandoff(branch)}
                        className="w-full py-4 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 border border-amber-100/50 hover:border-amber-500 group/handoff"
                    >
                        <Zap className="w-4 h-4 group-hover/handoff:animate-pulse" />
                        Smart Handoff Suggestions
                    </button>
                )}
                <button
                    onClick={() => onManageStaff(branch)}
                    className="w-full py-4 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 border border-slate-100 hover:border-slate-900 group/btn"
                >
                    <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Team Intelligence
                </button>
            </div>
        </div>
    );
};

const BranchDashboard = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(undefined);
    const [selectedHandoffBranch, setSelectedHandoffBranch] = useState<Branch | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'overview' | 'arena' | 'leaderboard'>('overview');

    const { data: branches, isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches
    });

    const { data: branchStatus = [] } = useQuery({
        queryKey: ['branch-status'],
        queryFn: getBranchOperationalStatus,
        refetchInterval: 60000
    });

    const statusById = useMemo(() => {
        return new Map(branchStatus.map(status => [status.id, status]));
    }, [branchStatus]);

    const mergedBranches = useMemo(() => {
        if (!branches) return [];
        return branches.map(branch => {
            const status = statusById.get(branch.id);
            if (!status) return branch;
            return {
                ...branch,
                is_currently_open: status.is_open,
                local_time: status.local_time,
                opening_time: status.opening_time,
                closing_time: status.closing_time,
                timezone: status.timezone
            };
        });
    }, [branches, statusById]);

    const filteredBranches = mergedBranches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalNodes = branchStatus.length ? branchStatus.length : mergedBranches.length;
    const activeNodes = branchStatus.length
        ? branchStatus.filter(status => status.is_open).length
        : mergedBranches.filter(branch => branch.is_currently_open).length;
    const networkUptime = totalNodes > 0 ? Math.round((activeNodes / totalNodes) * 1000) / 10 : 0;

    const handleAdd = () => {
        setSelectedBranch(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const handleManageStaff = (branch: Branch) => {
        navigate(`/branches/${branch.id}`);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Visualizing Global Network</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-16 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-2.5 h-12 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_20px_rgba(173,3,222,0.4)]" />
                        <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-none">Global Operations</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em] ml-8 opacity-60">Network monitoring - Institutional oversight - Regional intelligence</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={clsx(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'overview' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" />
                            Overview
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('arena')}
                        className={clsx(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'arena' ? "bg-[#AD03DE] text-white shadow-lg shadow-[#AD03DE]/30" : "text-slate-500 hover:bg-purple-50 hover:text-[#AD03DE]"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Elite Arena
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={clsx(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'leaderboard' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Leaderboard
                        </div>
                    </button>

                    <div className="w-px h-8 bg-slate-100 mx-2" />

                    <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-800 placeholder:text-slate-300 w-32 uppercase tracking-[0.2em]"
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        className="p-3 bg-slate-900 hover:bg-black text-white rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4 text-emerald-400" />
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Global Network Visualizers */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 h-[500px]">
                            <GlobalNetworkGlobe branches={mergedBranches} />
                        </div>
                        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col justify-center">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-2xl font-serif font-black text-slate-900 tracking-tighter">Network Vitality</h3>
                                </div>
                                <p className="text-xs font-serif font-bold text-slate-400">Regional Pulse - Efficiency Index - Global Scaling</p>
                            </div>
                            <div className="space-y-8">
                                <VitalityItem label="Global Nodes" value={totalNodes} percentage={100} color="bg-[#AD03DE]" />
                                <VitalityItem label="Active Hubs" value={activeNodes} percentage={totalNodes > 0 ? (activeNodes / totalNodes) * 100 : 0} color="bg-emerald-500" />
                                <VitalityItem label="Network Uptime" value={`${networkUptime}%`} percentage={networkUptime} color="bg-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Network Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                        {filteredBranches.map((branch) => (
                            <BranchCard
                                key={branch.id}
                                branch={branch}
                                onEdit={handleEdit}
                                onManageStaff={handleManageStaff}
                                onHandoff={(b) => setSelectedHandoffBranch(b)}
                            />
                        ))}

                        {/* Empty State */}
                        {filteredBranches.length === 0 && (
                            <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20 group">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-1000">
                                    <MapPin className="w-12 h-12 text-slate-100 group-hover:text-slate-200 transition-colors" strokeWidth={1} />
                                </div>
                                <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.5em]">Regional Intelligence Zero</h4>
                                <p className="text-sm text-slate-300 font-serif font-bold mt-3">Global infrastructure visualization requires branch deployment.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'arena' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <EmployeeArena />
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <Leaderboard />
                </div>
            )}

            {isModalOpen && (
                <BranchModal
                    isOpen={isModalOpen}
                    branch={selectedBranch}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedBranch(undefined);
                    }}
                />
            )}

            {isTransferModalOpen && (
                <TransferRequestModal
                    onClose={() => setIsTransferModalOpen(false)}
                />
            )}

            {selectedHandoffBranch && (
                <HandoffSuggestionsPanel
                    branch={selectedHandoffBranch}
                    onClose={() => setSelectedHandoffBranch(undefined)}
                />
            )}
        </div>
    );
};

const VitalityItem = ({ label, value, percentage, color }: { label: string, value: string | number, percentage: number, color: string }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-serif font-black text-slate-900">{value}</span>
        </div>
        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex items-center p-0.5">
            <div
                className={clsx("h-full rounded-full transition-all duration-1000", color)}
                style={{ width: `${percentage}% ` }}
            />
        </div>
    </div>
);

export default BranchDashboard;
