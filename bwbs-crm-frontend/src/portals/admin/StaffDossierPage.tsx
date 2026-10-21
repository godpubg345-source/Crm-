import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
    getUserById,
    updateUser,
    getUserStats,
    deleteUser,
    getPayrollReport,
    generatePayroll,
    type UserListItem,
    type PayrollReport
} from '../../services/users';
import { getBranches } from '../../services/branches';
import {
    X, Calendar, Zap, AlertCircle, Save, Trash2,
    Loader2, Trophy, Clock, ShieldCheck, ArrowRight,
    CreditCard, Download, TrendingUp, FileText, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const StaffDossierPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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
        base_salary: '0',
        joined_date: '',
        probation_end_date: '',
        contract_type: 'PROBATION',
        contract_progress: 0
    });

    const { data: staff, isLoading: isLoadingStaff } = useQuery({
        queryKey: ['staff', id],
        queryFn: () => getUserById(id!),
        enabled: !!id
    });

    const { data: stats } = useQuery({
        queryKey: ['staff-stats', id],
        queryFn: () => getUserStats(id!),
        enabled: !!id
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
        if (activeTab === 'payroll' && id) {
            getPayrollReport(id, 6).then(report => {
                setPayrollReport(report);
            }).catch(console.error);
        }
    }, [activeTab, id]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateUser(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['staff-stats', id] });
            queryClient.invalidateQueries({ queryKey: ['staff', id] });
            alert('Profile Updated Successfully');
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: () => deleteUser(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            navigate('/admin/team');
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

    if (isLoadingStaff) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-[#F8FAFC]">
                <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin mb-4" />
                <p className="text-xs font-semibold text-slate-400">Loading Staff Profile...</p>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-[#F8FAFC]">
                <p className="text-xl font-semibold text-slate-900 mb-4">Staff Member Not Found</p>
                <button
                    onClick={() => navigate('/admin/team')}
                    className="flex items-center gap-2 text-sm font-bold text-[#7c3aed] hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to Directory
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Performance', icon: Zap },
        { id: 'employment', label: 'Profile', icon: ShieldCheck },
        { id: 'payroll', label: 'Payroll', icon: CreditCard },
        { id: 'incentives', label: 'Incentives', icon: Trophy },
        { id: 'audit', label: 'Activity Log', icon: Clock },
    ];

    return (
        <div className="min-h-screen p-6 lg:p-12 pb-32 max-w-7xl mx-auto space-y-8">
            <button
                onClick={() => navigate('/admin/team')}
                className="flex items-center gap-3 text-xs font-semibold text-slate-400 hover:text-[#7c3aed] transition-all group w-fit"
            >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-[#7c3aed]/5 group-hover:border-[#7c3aed]/20 transition-colors">
                    <ArrowLeft className="w-4 h-4 transition-transform" />
                </div>
                Back to staff
            </button>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[800px]">
                {/* Header Section */}
                <div className="p-6 bg-slate-900 text-white relative">

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6 mt-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-indigo-600 flex items-center justify-center text-3xl font-semibold shadow-sm">
                                {staff.first_name?.[0]}{staff.last_name?.[0]}
                            </div>
                            <div>
                                <h2 className="text-3xl font-semibold tracking-tight">{staff.first_name} {staff.last_name}</h2>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="px-3 py-1 rounded-lg bg-[#7c3aed] text-xs font-semibold text-white shadow-sm">
                                        {staff.role_display || 'Staff'}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        Active Since {formData.joined_date ? new Date(formData.joined_date).getFullYear() : '2024'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to deactivate this account? They will lose all access.')) {
                                            deactivateMutation.mutate();
                                        }
                                    }}
                                    disabled={deactivateMutation.isPending}
                                    className="px-6 py-2.5 rounded-xl border border-rose-500/20 text-xs font-semibold text-rose-500 hover:bg-rose-500 hover:text-white transition-all focus:outline-none"
                                >
                                    Deactivate Account
                                </button>
                                <button
                                    form="dossier-form"
                                    type="submit"
                                    disabled={updateMutation.isPending || activeTab !== 'employment'}
                                    className={clsx(
                                        "px-8 py-3 rounded-2xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2",
                                        activeTab === 'employment'
                                            ? "bg-white text-slate-900 hover:bg-[#7c3aed] hover:text-white"
                                            : "bg-white/10 text-white/50 cursor-not-allowed border border-white/10"
                                    )}
                                >
                                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                            {activeTab !== 'employment' && (
                                <p className="text-xs text-slate-500 mt-2">Go to Profile tab to edit fields</p>
                            )}
                        </div>
                    </div>

                    {/* Nav Tabs */}
                    <div className="flex items-center gap-1 mt-6 p-1.5 bg-white/5 rounded-2xl w-fit relative z-10 border border-white/5">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold transition-all",
                                    activeTab === tab.id
                                        ? "bg-[#7c3aed] text-white shadow-sm font-bold"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 bg-[#F8FAFC]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-semibold text-slate-400">Performance Metrics</h3>
                                        <div className="w-full h-px bg-slate-200 ml-4" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-white rounded-xl border border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                                                <Zap className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <p className="text-3xl font-semibold text-slate-900">{stats?.conversion_rate || 0}%</p>
                                            <p className="text-xs font-semibold text-slate-400 mt-2">Conversion Rate</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-xl border border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center mb-6">
                                                <Trophy className="w-6 h-6 text-[#7c3aed]" />
                                            </div>
                                            <p className="text-3xl font-semibold text-slate-900">{stats?.enrolled_leads || 0}</p>
                                            <p className="text-xs font-semibold text-slate-400 mt-2">Enrollments</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-xl border border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                                <AlertCircle className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <p className="text-3xl font-semibold text-slate-900">{stats?.xp || 0}</p>
                                            <p className="text-xs font-semibold text-slate-400 mt-2">Points earned</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-semibold text-slate-400">Financial Impact</h3>
                                        <div className="w-full h-px bg-slate-200 ml-4" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500">Generated Revenue</span>
                                            </div>
                                            <span className="text-2xl font-semibold text-slate-900">£{Number(stats?.revenue_generated || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500">Wallet Balance</span>
                                            </div>
                                            <span className="text-2xl font-semibold text-[#7c3aed]">£{Number(stats?.wallet_balance || 0).toLocaleString()}</span>
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
                                <form id="dossier-form" onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                                    <section>
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xs font-semibold text-slate-400">Personal Information</h3>
                                            <div className="w-full h-px bg-slate-200 ml-4" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-400 mb-3 pl-2">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.first_name}
                                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-400 mb-3 pl-2">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.last_name}
                                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-3 pl-2">Role</label>
                                                <select
                                                    value={formData.role}
                                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none appearance-none cursor-pointer transition-all"
                                                >
                                                    <option value="COUNSELOR">Counselor</option>
                                                    <option value="DOC_PROCESSOR">Doc Processor</option>
                                                    <option value="BRANCH_MANAGER">Branch Manager</option>
                                                    <option value="SUPER_ADMIN">Super Admin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-3 pl-2">Branch / Location</label>
                                                <select
                                                    value={formData.branch}
                                                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none appearance-none cursor-pointer transition-all"
                                                >
                                                    <option value="">Headquarters</option>
                                                    {branches?.map(b => (
                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xs font-semibold text-slate-400">Employment Details</h3>
                                            <div className="w-full h-px bg-slate-200 ml-4" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-semibold text-indigo-600 mb-3 pl-2">Base Salary (Annual)</label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                                                    <input
                                                        type="number"
                                                        value={formData.base_salary}
                                                        onChange={e => setFormData({ ...formData, base_salary: e.target.value })}
                                                        className="w-full pl-10 pr-6 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl text-sm font-semibold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-3 pl-2">Joined Date</label>
                                                <input
                                                    type="date"
                                                    value={formData.joined_date}
                                                    onChange={e => setFormData({ ...formData, joined_date: e.target.value })}
                                                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <label className="block text-[12px] font-semibold text-white">Contract Progress</label>
                                                        <p className="text-xs text-slate-400 font-medium mt-1">Track overall employee performance</p>
                                                    </div>
                                                    <span className="text-3xl font-semibold text-[#7c3aed]">{formData.contract_progress}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={formData.contract_progress}
                                                    onChange={e => setFormData({ ...formData, contract_progress: parseInt(e.target.value) })}
                                                    className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#7c3aed]"
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
                                className="space-y-8 max-w-5xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-slate-400">Monthly Incentives</h3>
                                    <div className="w-full h-px bg-slate-200 ml-4" />
                                </div>

                                {!staff.performance_incentives || staff.performance_incentives.length === 0 ? (
                                    <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                        <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-base font-bold text-slate-400">No incentives recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {staff.performance_incentives.map(inc => (
                                            <div key={inc.id} className="p-6 bg-white rounded-xl border border-slate-200 flex items-center justify-between group hover:border-[#7c3aed]/20 transition-all duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                                        <span className="text-xs font-semibold text-slate-400 leading-none mb-1">
                                                            {new Date(inc.month).toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                        <span className="text-lg font-semibold text-slate-900 leading-none">
                                                            {new Date(inc.month).getFullYear().toString().slice(-2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{inc.month_display}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Pts: {inc.points_earned}</span>
                                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Apps: {inc.conversions}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-semibold text-[#7c3aed] mb-2">£{inc.total_incentive}</p>
                                                    <span className={clsx(
                                                        "text-xs font-semibold px-4 py-1.5 rounded-xl",
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
                                className="space-y-6 max-w-5xl"
                            >
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-semibold text-slate-400">Payroll Summary (Last 6 Months)</h3>
                                        <div className="w-full h-px bg-slate-200 ml-4" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 bg-slate-900 rounded-2xl relative overflow-hidden group shadow-sm">
                                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-200">
                                                <TrendingUp className="w-24 h-24 text-white" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-400 mb-2 relative z-10">Total Gross Pay</p>
                                            <p className="text-3xl font-semibold text-white relative z-10">
                                                £{Number(payrollReport?.total_gross || (staff as any).payroll_records?.reduce((acc: number, curr: any) => acc + Number(curr.gross_payout), 0) || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-6 bg-[#7c3aed] rounded-2xl relative overflow-hidden group shadow-sm">
                                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-200">
                                                <CreditCard className="w-24 h-24 text-white" />
                                            </div>
                                            <p className="text-xs font-semibold text-white/70 mb-2 relative z-10">Total Net Pay</p>
                                            <p className="text-3xl font-semibold text-white relative z-10">
                                                £{Number(payrollReport?.total_net || (staff as any).payroll_records?.reduce((acc: number, curr: any) => acc + Number(curr.net_payout), 0) || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-semibold text-slate-400">Payroll History</h3>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const month = new Date().toISOString().split('T')[0];
                                                setIsGeneratingPayroll(true);
                                                try {
                                                    await generatePayroll(id!, month);
                                                    queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
                                                    queryClient.invalidateQueries({ queryKey: ['staff', id] });
                                                } catch (err) {
                                                    console.error("Payroll generation failed:", err);
                                                    alert("Failed to generate payroll. It may already exist for this month.");
                                                } finally {
                                                    setIsGeneratingPayroll(false);
                                                }
                                            }}
                                            disabled={isGeneratingPayroll}
                                            className="px-6 py-3 bg-white border border-slate-200 hover:border-[#7c3aed] hover:text-[#7c3aed] rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                                        >
                                            {isGeneratingPayroll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-[#7c3aed]" />}
                                            Generate Payroll
                                        </button>
                                    </div>

                                    {(!staff.payroll_records || staff.payroll_records.length === 0) ? (
                                        <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <p className="text-base font-bold text-slate-400">No payroll records found.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6">
                                            {staff.payroll_records.map(pay => (
                                                <div key={pay.id} className="p-6 bg-white rounded-xl border border-slate-200 flex items-center justify-between group hover:border-[#7c3aed]/30 transition-all duration-300">
                                                    <div className="flex items-center gap-8">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                            <FileText className="w-8 h-8 text-slate-400 group-hover:text-[#7c3aed] transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 mb-1">{pay.month_display}</p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                                    Net: <span className="text-slate-900">£{Number(pay.net_payout).toLocaleString()}</span>
                                                                </span>
                                                                <span className={clsx(
                                                                    "text-xs font-semibold px-3 py-1.5 rounded-xl",
                                                                    pay.status === 'PAID' ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"
                                                                )}>
                                                                    {pay.status_display}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {pay.payslip_pdf && (
                                                            <a
                                                                href={pay.payslip_pdf}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#7c3aed] hover:text-[#7c3aed] transition-all text-slate-500 text-xs font-semibold flex items-center gap-2"
                                                                title="Download Payslip"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
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
                                className="space-y-8 max-w-4xl"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xs font-semibold text-slate-400">Activity Log</h3>
                                    <div className="w-full h-px bg-slate-200 ml-4" />
                                </div>

                                {!staff.audit_records || staff.audit_records.length === 0 ? (
                                    <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                        <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-base font-bold text-slate-400">No activity recorded.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                                        {staff.audit_records.map(log => (
                                            <div key={log.id} className="relative pl-16">
                                                <div className="absolute left-0 top-1 w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center z-10">
                                                    <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />
                                                </div>
                                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 bg-purple-50 rounded-lg text-xs font-semibold text-[#7c3aed]">
                                                            {log.actor_name || 'SYSTEM'}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 mb-3">
                                                        Updated <span className="text-[#7c3aed] font-semibold">{log.field_name}</span>
                                                    </p>
                                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl text-xs font-semibold border border-slate-100">
                                                        <span className="text-slate-400 line-through decoration-rose-400/50">{log.old_value || 'None'}</span>
                                                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                            <ArrowRight className="w-3 h-3 text-slate-300" />
                                                        </div>
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
            </div>
        </div>
    );
};

export default StaffDossierPage;
