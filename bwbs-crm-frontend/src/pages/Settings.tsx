import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, changePassword } from '../services/auth';
import {
    User,
    Mail,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Fingerprint,
    CreditCard,
    Save,
    Camera,
    Bell,
    Globe,
    Zap,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// SETTINGS - PERSONALIZATION & SECURITY HUB
// ============================================================================

const Settings = () => {
    const user = getCurrentUser();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'PREFERENCES'>('PROFILE');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    });

    // Security State
    const [securityData, setSecurityData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    // Mutations
    const profileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            setSuccessMessage('Profile intelligence synchronized');
            setTimeout(() => setSuccessMessage(null), 3000);
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setSuccessMessage('Security protocols updated');
            setSecurityData({ old_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileMutation.mutate(profileData);
    };

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.new_password !== securityData.confirm_password) {
            alert('Security mismatch: Confirm password must be identical');
            return;
        }
        passwordMutation.mutate(securityData);
    };

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-[#AD03DE] rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight leading-none">Settings & Profile</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6 opacity-60">Personalization center • Security protocols</p>
                </div>

                {successMessage && (
                    <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/10 animate-in slide-in-from-top-4 duration-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{successMessage}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Tactical Navigation Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
                        <button
                            onClick={() => setActiveTab('PROFILE')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group",
                                activeTab === 'PROFILE' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <User className={clsx("w-4 h-4", activeTab === 'PROFILE' ? "text-emerald-400" : "text-slate-300 group-hover:text-[#AD03DE]")} />
                            Scholarly Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('SECURITY')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group",
                                activeTab === 'SECURITY' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Lock className={clsx("w-4 h-4", activeTab === 'SECURITY' ? "text-rose-400" : "text-slate-300 group-hover:text-[#AD03DE]")} />
                            Security Protocols
                        </button>
                        <button
                            onClick={() => setActiveTab('PREFERENCES')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all group",
                                activeTab === 'PREFERENCES' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Bell className={clsx("w-4 h-4", activeTab === 'PREFERENCES' ? "text-amber-400" : "text-slate-300 group-hover:text-[#AD03DE]")} />
                            System Intel
                        </button>
                    </div>

                    {/* Meta Card */}
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group shadow-2xl shadow-slate-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4 leading-none">Institutional Role</p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-serif font-bold text-white leading-none mb-1">{user?.role.replace('_', ' ')}</p>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{user?.branch_details?.name || 'Global HQ'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white p-12 lg:p-16 rounded-[3.5rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] relative overflow-hidden">
                        {/* Tab: PROFILE */}
                        {activeTab === 'PROFILE' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-serif font-bold text-slate-900">Institutional Identity</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your scholarly profile information</p>
                                    </div>
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#AD03DE] to-indigo-600 p-1 shadow-xl shadow-[#AD03DE]/20 group-hover:rotate-6 transition-all duration-700 cursor-pointer">
                                            <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center text-[#AD03DE] font-serif font-bold text-3xl">
                                                {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
                                            </div>
                                        </div>
                                        <button type="button" className="absolute -bottom-2 -right-2 p-2.5 bg-slate-900 text-white rounded-xl border-4 border-white shadow-lg shadow-black/10 hover:scale-110 transition-all active:scale-95 group-hover:-rotate-12">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/20 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/20 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Authenticated Email</label>
                                    <div className="relative group">
                                        <input
                                            value={profileData.email}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/20 transition-all uppercase tracking-widest"
                                        />
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                                    </div>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileMutation.isPending}
                                        className="px-12 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
                                        Synchronize Profile
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: SECURITY */}
                        {activeTab === 'SECURITY' && (
                            <form onSubmit={handleSecuritySubmit} className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif font-bold text-slate-900">Security Protocols</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage access vectors and password security</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={securityData.old_password}
                                                    onChange={(e) => setSecurityData(prev => ({ ...prev, old_password: e.target.value }))}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 transition-all uppercase tracking-widest"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-all text-slate-300">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Access Token (Password)</label>
                                            <input
                                                type="password"
                                                value={securityData.new_password}
                                                onChange={(e) => setSecurityData(prev => ({ ...prev, new_password: e.target.value }))}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Vector</label>
                                            <input
                                                type="password"
                                                value={securityData.confirm_password}
                                                onChange={(e) => setSecurityData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                        <Fingerprint className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed pr-8">
                                        By updating your access vector, all current sessions on other institutional devices will be terminated for security compliance.
                                    </p>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordMutation.isPending}
                                        className="px-12 py-4 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
                                        Update Access Protocols
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: PREFERENCES */}
                        {activeTab === 'PREFERENCES' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-serif font-bold text-slate-900">System Intel</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customize system notifications and regional settings</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#AD03DE] shadow-sm group-hover:rotate-6 transition-all">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Global Intelligence Alerts</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Email & System notifications for critical updates</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 shadow-inner cursor-pointer hover:bg-emerald-100 transition-colors">
                                            <div className="h-6 w-6 rounded-full bg-white shadow-xl translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:rotate-6 transition-all">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Regional Optimization</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Automatic time-zone and currency synchronization</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-500 shadow-inner cursor-pointer">
                                            <div className="h-6 w-6 rounded-full bg-white shadow-xl translate-x-7 transition-transform" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-20 border-t border-slate-50 grid grid-cols-2 gap-10">
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System Node Vector</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-sm">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-mono font-bold text-slate-800">NODE-V2.0.44-PROD</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Engagement Tier</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Enterprise Premium</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
