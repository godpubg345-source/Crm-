import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateUser, getUserStats, deleteUser, getPayrollReport, generatePayroll, type UserListItem, type PayrollReport } from '../../services/users';
import { getBranches } from '../../services/branches';
import {
    X, Calendar, Zap, AlertCircle, Save, Trash2,
    Loader2, Trophy, Clock, ShieldCheck, ArrowRight,
    CreditCard, Download, TrendingUp, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface DossierProps {
    isOpen: boolean;
    onClose: () => void;
    staff: UserListItem | null;
}

export const StaffDossier = ({ isOpen, onClose, staff }: DossierProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'incentives' | 'audit' | 'payroll'>('overview');
    const [payrollReport, setPayrollReport] = useState<PayrollReport | null>(null);
    const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        role: '',
        branch: '',
        is_active: true,
        // HR Dossier Fields
        base_salary: '0',
        joined_date: '',
        probation_end_date: '',
        contract_type: 'PROBATION',
        contract_progress: 0
    });

    const queryClient = useQueryClient();

    const { data: stats } = useQuery({
        queryKey: ['staff-stats', staff?.id],
        queryFn: () => getUserStats(staff!.id),
        enabled: !!staff?.id
    });

    const { data: branches } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                first_name: staff.first_name || '',
                last_name: staff.last_name || '',
                phone: (staff as any).phone || '',
                role: staff.role || '',
                branch: staff.branch || '',
                is_active: (staff as any).is_active !== false,
                base_salary: staff.dossier?.base_salary || '0',
                joined_date: staff.dossier?.joined_date || '',
                probation_end_date: staff.dossier?.probation_end_date || '',
                contract_type: staff.dossier?.contract_type || 'PROBATION',
                contract_progress: staff.dossier?.contract_progress || 0
            });
        }
    }, [staff]);

    useEffect(() => {
        if (activeTab === 'payroll' && staff?.id) {
            getPayrollReport(staff.id, 6).then(report => {
                setPayrollReport(report);
            }).catch(console.error);
        }
    }, [activeTab, staff?.id]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateUser(staff!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['staff-stats', staff?.id] });
            onClose();
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: () => deleteUser(staff!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const {
            base_salary, joined_date, probation_end_date,
            contract_type, contract_progress, ...userData
        } = formData;

        updateMutation.mutate({
            ...userData,
            dossier: {
                base_salary,
                joined_date: joined_date || null,
                probation_end_date: probation_end_date || null,
                contract_type,
                contract_progress
            }
        });
    };

    if (!staff) return null;

    const tabs = [
        { id: 'overview', label: 'Intelligence', icon: Zap },
        { id: 'employment', label: 'Dossier', icon: ShieldCheck },
        { id: 'payroll', label: 'Payroll', icon: CreditCard },
        { id: 'incentives', label: 'Incentives', icon: Trophy },
        { id: 'audit', label: 'Audit Log', icon: Clock },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[160] overflow-hidden flex flex-col"
                    >
                        {/* Header Section */}
                        <div className="p-8 bg-slate-900 text-white relative">
                            <button
                                onClick={onClose}
                                className="absolute top-8 right-8 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-black text-xs uppercase"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-6 mt-4">
                                <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#AD03DE] to-indigo-600 flex items-center justify-center text-2xl font-serif font-black shadow-2xl">
                                    {staff.first_name?.[0]}{staff.last_name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif font-black tracking-tight">{staff.first_name} {staff.last_name}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-3 py-1 rounded-lg bg-[#AD03DE] text-[10px] font-black uppercase tracking-widest text-white">
                                            {staff.role_display || 'Operative'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            Active Since {formData.joined_date ? new Date(formData.joined_date).getFullYear() : '2024'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nav Tabs */}
                            <div className="flex items-center gap-1 mt-10 p-1 bg-white/5 rounded-2xl w-fit">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                                            activeTab === tab.id
                                                ? "bg-[#AD03DE] text-white shadow-lg shadow-[#AD03DE]/20"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto premium-scrollbar p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-10"
                                    >
                                        <section>
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Forensic Intelligence</h3>
                                                <div className="w-full h-px bg-slate-100 ml-4" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-6">
                                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-[#AD03DE]/30 transition-all">
                                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                                                        <Zap className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <p className="text-3xl font-serif font-black text-slate-900">{stats?.conversion_rate || 0}%</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Enrolment Rate</p>
                                                </div>
                                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-[#AD03DE]/30 transition-all">
                                                    <div className="w-10 h-10 rounded-2xl bg-[#AD03DE]/10 flex items-center justify-center mb-4">
                                                        <Trophy className="w-5 h-5 text-[#AD03DE]" />
                                                    </div>
                                                    <p className="text-3xl font-serif font-black text-slate-900">{stats?.enrolled_leads || 0}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Deployments</p>
                                                </div>
                                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-[#AD03DE]/30 transition-all">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                                                        <AlertCircle className="w-5 h-5 text-indigo-500" />
                                                    </div>
                                                    <p className="text-3xl font-serif font-black text-slate-900">{stats?.xp || 0}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Intel XP</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Stats</h3>
                                                <div className="w-full h-px bg-slate-100 ml-4" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Revenue Influence</span>
                                                    <span className="text-lg font-serif font-black text-slate-900">£{Number(stats?.revenue_generated || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Asset Wallet Balance</span>
                                                    <span className="text-lg font-serif font-black text-[#AD03DE]">£{Number(stats?.wallet_balance || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === 'employment' && (
                                    <motion.div
                                        key="employment"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <form id="dossier-form" onSubmit={handleSubmit} className="space-y-12">
                                            <section>
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Protocol</h3>
                                                    <div className="w-full h-px bg-slate-100 ml-4" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="col-span-2 grid grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operative First Name</label>
                                                            <input
                                                                type="text"
                                                                value={formData.first_name}
                                                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                                className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operative Last Name</label>
                                                            <input
                                                                type="text"
                                                                value={formData.last_name}
                                                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                                className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Rank</label>
                                                        <select
                                                            value={formData.role}
                                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="COUNSELOR">Counselor</option>
                                                            <option value="DOC_PROCESSOR">Doc Processor</option>
                                                            <option value="BRANCH_MANAGER">Branch Manager</option>
                                                            <option value="SUPER_ADMIN">Super Admin</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset Deployment (Branch)</label>
                                                        <select
                                                            value={formData.branch}
                                                            onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none appearance-none cursor-pointer"
                                                        >
                                                            <option value="">HQ COMMAND</option>
                                                            {branches?.map(b => (
                                                                <option key={b.id} value={b.id}>{b.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </section>

                                            <section>
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Financial Dossier</h3>
                                                    <div className="w-full h-px bg-slate-100 ml-4" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-indigo-600">Base Salary (Annual)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                                                            <input
                                                                type="number"
                                                                value={formData.base_salary}
                                                                onChange={e => setFormData({ ...formData, base_salary: e.target.value })}
                                                                className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 focus:border-[#AD03DE]/30 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Enlistment Date</label>
                                                        <input
                                                            type="date"
                                                            value={formData.joined_date}
                                                            onChange={e => setFormData({ ...formData, joined_date: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#AD03DE]/20 outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-2 p-6 bg-slate-900/5 rounded-[2.5rem] border border-slate-100">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Contract Integrity</label>
                                                            <span className="text-[12px] font-serif font-black text-[#AD03DE]">{formData.contract_progress}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={formData.contract_progress}
                                                            onChange={e => setFormData({ ...formData, contract_progress: parseInt(e.target.value) })}
                                                            className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#AD03DE]"
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </form>
                                    </motion.div>
                                )}

                                {activeTab === 'incentives' && (
                                    <motion.div
                                        key="incentives"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Monthly Incentive Ledger</h3>
                                            <div className="w-full h-px bg-slate-100 ml-4" />
                                        </div>

                                        {!staff.performance_incentives || staff.performance_incentives.length === 0 ? (
                                            <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                                <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-sm font-bold text-slate-400">No incentive snapshots generated yet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {staff.performance_incentives.map(inc => (
                                                    <div key={inc.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-[#AD03DE]/20 transition-all">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center text-center">
                                                                <span className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">
                                                                    {new Date(inc.month).toLocaleString('default', { month: 'short' })}
                                                                </span>
                                                                <span className="text-sm font-black text-slate-900 leading-none">
                                                                    {new Date(inc.month).getFullYear().toString().slice(-2)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{inc.month_display}</p>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-[10px] font-bold text-slate-400">Pts: {inc.points_earned}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400">Apps: {inc.conversions}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-serif font-black text-[#AD03DE]">£{inc.total_incentive}</p>
                                                            <span className={clsx(
                                                                "text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full",
                                                                inc.status === 'PAID' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                                            )}>
                                                                {inc.status_display}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'payroll' && (
                                    <motion.div
                                        key="payroll"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-10"
                                    >
                                        <section>
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Financial Aggregation (6M)</h3>
                                                <div className="w-full h-px bg-slate-100 ml-4" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                                                        <TrendingUp className="w-16 h-16 text-white" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Gross Payout</p>
                                                    <p className="text-3xl font-serif font-black text-white">
                                                        £{Number(payrollReport?.total_gross || (staff as any).payroll_records?.reduce((acc: number, curr: any) => acc + Number(curr.gross_payout), 0) || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-8 bg-[#AD03DE] rounded-[2.5rem] relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                                                        <CreditCard className="w-16 h-16 text-white" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-100 uppercase tracking-widest mb-2">Net Disbursement</p>
                                                    <p className="text-3xl font-serif font-black text-white">
                                                        £{Number(payrollReport?.total_net || (staff as any).payroll_records?.reduce((acc: number, curr: any) => acc + Number(curr.net_payout), 0) || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Salary Ledger</h3>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const month = new Date().toISOString().split('T')[0];
                                                        setIsGeneratingPayroll(true);
                                                        try {
                                                            await generatePayroll(staff.id, month);
                                                            queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
                                                        } catch (err) {
                                                            console.error("Payroll generation failed:", err);
                                                        } finally {
                                                            setIsGeneratingPayroll(false);
                                                        }
                                                    }}
                                                    disabled={isGeneratingPayroll}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                                >
                                                    {isGeneratingPayroll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-[#AD03DE]" />}
                                                    Generate Current
                                                </button>
                                            </div>

                                            {(!staff.payroll_records || staff.payroll_records.length === 0) ? (
                                                <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-sm font-bold text-slate-400">No payroll records detected.</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4">
                                                    {staff.payroll_records.map(pay => (
                                                        <div key={pay.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:border-[#AD03DE]/20 transition-all">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                                                                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-[#AD03DE] transition-colors" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{pay.month_display}</p>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Net: £{Number(pay.net_payout).toLocaleString()}</span>
                                                                        <span className={clsx(
                                                                            "text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full",
                                                                            pay.status === 'PAID' ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"
                                                                        )}>
                                                                            {pay.status_display}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {pay.payslip_pdf && (
                                                                    <a
                                                                        href={pay.payslip_pdf}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#AD03DE] hover:text-[#AD03DE] transition-all text-slate-400"
                                                                        title="Download Payslip"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === 'audit' && (
                                    <motion.div
                                        key="audit"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Forensic Audit Trail</h3>
                                            <div className="w-full h-px bg-slate-100 ml-4" />
                                        </div>

                                        {!staff.audit_records || staff.audit_records.length === 0 ? (
                                            <div className="p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-sm font-bold text-slate-400">No forensic events recorded.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                                                {staff.audit_records.map(log => (
                                                    <div key={log.id} className="relative pl-12">
                                                        <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center z-10">
                                                            <ShieldCheck className="w-4 h-4 text-[#AD03DE]" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#AD03DE]">
                                                                    {log.actor_name || 'SYSTEM'}
                                                                </span>
                                                                <span className="text-[8px] font-bold text-slate-400">
                                                                    {new Date(log.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-900 mt-1">
                                                                Updated <span className="text-[#AD03DE] font-bold">{log.field_name}</span>
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2 p-3 bg-slate-50 rounded-xl text-[10px] font-semibold">
                                                                <span className="text-slate-400 line-through decoration-rose-400/50">{log.old_value || 'None'}</span>
                                                                <ArrowRight className="w-3 h-3 text-slate-300" />
                                                                <span className="text-slate-900">{log.new_value}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Controls */}
                        <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-white relative z-20">
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Are you sure you want to deactivate this operative? They will lose all access.')) {
                                        deactivateMutation.mutate();
                                    }
                                }}
                                disabled={deactivateMutation.isPending}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Deactivate Unit
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="dossier-form"
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-[#AD03DE] transition-all flex items-center gap-2"
                                >
                                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Commit Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
