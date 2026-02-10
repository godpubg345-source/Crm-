import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Zap,
    TrendingUp,
    BarChart3,
    ShieldCheck,
    Target,
    MessageSquare,
    Globe
} from 'lucide-react';

// Services
import {
    getBranches,
    getBranchAnalytics,
    type Branch,
} from '../services/branches';
import { getUsers } from '../services/users';

// Shared Components
import TabButton from './BranchCommandCenter/components/TabButton';

// Tab Components
import OverviewTab from './BranchCommandCenter/tabs/OverviewTab';
import TeamTab from './BranchCommandCenter/tabs/TeamTab';
import FinanceTab from './BranchCommandCenter/tabs/FinanceTab';
import OperationsTab from './BranchCommandCenter/tabs/OperationsTab';
import ReportsTab from './BranchCommandCenter/tabs/ReportsTab';
import IntelligenceTab from './BranchCommandCenter/tabs/IntelligenceTab';
import TargetsTab from './BranchCommandCenter/tabs/TargetsTab';
import CommsTab from './BranchCommandCenter/tabs/CommsTab';

// Modal Components
import OnboardStaffModal from './BranchCommandCenter/modals/OnboardStaffModal';
import SetTargetModal from './BranchCommandCenter/modals/SetTargetModal';
import RecordTransactionModal from './BranchCommandCenter/modals/RecordTransactionModal';
import AddAssetModal from './BranchCommandCenter/modals/AddAssetModal';
import AddComplaintModal from './BranchCommandCenter/modals/AddComplaintModal';
import BroadcastModal from './BranchCommandCenter/modals/BroadcastModal';

// Types
import type { TabType } from './BranchCommandCenter/types';

const BranchCommandCenter = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Modals State
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

    // Data Queries
    const { data: branches } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: getBranches
    });
    const branch = branches?.find((b: Branch) => b.id === id);

    const { data: analytics } = useQuery({
        queryKey: ['branch-analytics', id],
        queryFn: () => getBranchAnalytics(id!),
        enabled: !!id
    });

    const { data: staff } = useQuery({
        queryKey: ['branch-staff', id],
        queryFn: () => getUsers(undefined, id),
        enabled: !!id
    });

    if (!branch) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] animate-pulse">Synchronizing Regional Node...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-12 font-sans selection:bg-[#AD03DE]/10 selection:text-[#AD03DE]">
            {/* Command Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">Node Config: {branch.id.split('-')[0]}</div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Link Established</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Globe className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-tight">{branch.name}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-4">
                                {branch.country}
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[#AD03DE]">Regional Command Center</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="bg-white/70 backdrop-blur-md p-2 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-wrap items-center gap-1">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
                    <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={Users} label="Personnel" />
                    <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={Zap} label="Finance" />
                    <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon={BarChart3} label="Operations" />
                    <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={ShieldCheck} label="Reports" />
                    <TabButton active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={TrendingUp} label="Intelligence" />
                    <TabButton active={activeTab === 'targets'} onClick={() => setActiveTab('targets')} icon={Target} label="Targets" />
                    <TabButton active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} icon={MessageSquare} label="Comms" />
                </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 gap-8 min-h-[600px]"
            >
                {activeTab === 'overview' && <OverviewTab branch={branch} analytics={analytics} staff={staff} />}
                {activeTab === 'team' && <TeamTab branchId={branch.id} staff={staff} onOnboard={() => setIsStaffModalOpen(true)} />}
                {activeTab === 'finance' && <FinanceTab branchId={branch.id} staff={staff} onRecordTransaction={() => setIsTransactionModalOpen(true)} />}
                {activeTab === 'assets' && (
                    <OperationsTab
                        branchId={branch.id}
                        onAddAsset={() => setIsAssetModalOpen(true)}
                        onAddComplaint={() => setIsComplaintModalOpen(true)}
                    />
                )}
                {activeTab === 'reports' && <ReportsTab branchId={branch.id} analytics={analytics} />}
                {activeTab === 'intelligence' && <IntelligenceTab branchId={branch.id} />}
                {activeTab === 'targets' && (
                    <TargetsTab
                        branchId={branch.id}
                        analytics={analytics}
                        onSetQuota={() => setIsQuotaModalOpen(true)}
                    />
                )}
                {activeTab === 'comms' && <CommsTab branchId={branch.id} onBroadcast={() => setIsBroadcastModalOpen(true)} />}
            </motion.div>

            {/* Operational Modals */}
            <OnboardStaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} branchId={branch.id} />
            <SetTargetModal isOpen={isQuotaModalOpen} onClose={() => setIsQuotaModalOpen(false)} branchId={branch.id} />
            <RecordTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} branchId={branch.id} />
            <AddAssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} branchId={branch.id} />
            <AddComplaintModal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} branchId={branch.id} />
            <BroadcastModal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} branchId={branch.id} />
        </div>
    );
};

export default BranchCommandCenter;
