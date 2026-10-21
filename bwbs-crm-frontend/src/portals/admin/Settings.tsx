import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateProfile, changePassword } from '../../services/auth';
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
        <div className="p-1 lg:p-4 space-y-6 animate-in fade-in duration-200 ease-out pe-6 pb-20">
            {/* Tactical Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Settings</h1>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 opacity-60">Your profile, password and preferences</p>
                </div>

                {successMessage && (
                    <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm animate-in slide-in-from-top-4 duration-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-600">{successMessage}</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Tactical Navigation Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
                        <button
                            onClick={() => setActiveTab('PROFILE')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold transition-all group",
                                activeTab === 'PROFILE' ? "bg-slate-900 text-white shadow-sm " : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <User className={clsx("w-4 h-4", activeTab === 'PROFILE' ? "text-emerald-400" : "text-slate-300 group-hover:text-[#7c3aed]")} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('SECURITY')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold transition-all group",
                                activeTab === 'SECURITY' ? "bg-slate-900 text-white shadow-sm " : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Lock className={clsx("w-4 h-4", activeTab === 'SECURITY' ? "text-rose-400" : "text-slate-300 group-hover:text-[#7c3aed]")} />
                            Password & Security
                        </button>
                        <button
                            onClick={() => setActiveTab('PREFERENCES')}
                            className={clsx(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold transition-all group",
                                activeTab === 'PREFERENCES' ? "bg-slate-900 text-white shadow-sm " : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <Bell className={clsx("w-4 h-4", activeTab === 'PREFERENCES' ? "text-amber-400" : "text-slate-300 group-hover:text-[#7c3aed]")} />
                            Preferences
                        </button>
                    </div>

                    {/* Meta Card */}
                    <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-6 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-200" />
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-white/40 mb-4 leading-none">Role</p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white leading-none mb-1">{user?.role.replace('_', ' ')}</p>
                                    <p className="text-[11px] font-bold text-white/40">{user?.branch_details?.name || 'Global HQ'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    <div className="bg-white p-6 lg:p-16 rounded-xl border border-slate-200 relative overflow-hidden">
                        {/* Tab: PROFILE */}
                        {activeTab === 'PROFILE' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-200">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-slate-900">Profile</h3>
                                        <p className="text-xs text-slate-500">Update your name and contact details</p>
                                    </div>
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-indigo-600 p-1 shadow-sm transition-all duration-200 cursor-pointer">
                                            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-[#7c3aed] font-bold text-3xl">
                                                {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
                                            </div>
                                        </div>
                                        <button type="button" className="absolute -bottom-2 -right-2 p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl border-4 border-white shadow-sm transition-all">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs text-slate-500 ml-1">First Name</label>
                                        <input
                                            value={profileData.first_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs text-slate-500 ml-1">Last Name</label>
                                        <input
                                            value={profileData.last_name}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs text-slate-500 ml-1">Email</label>
                                    <div className="relative group">
                                        <input
                                            value={profileData.email}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full pl-14 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/20 transition-all"
                                        />
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                                    </div>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileMutation.isPending}
                                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        {profileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-emerald-400 transition-transform" />}
                                        Save changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: SECURITY */}
                        {activeTab === 'SECURITY' && (
                            <form onSubmit={handleSecuritySubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-200">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-slate-900">Password & Security</h3>
                                    <p className="text-xs text-slate-500">Change your password</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs text-slate-500 ml-1">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={securityData.old_password}
                                                    onChange={(e) => setSecurityData(prev => ({ ...prev, old_password: e.target.value }))}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 transition-all"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-all text-slate-300">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs text-slate-500 ml-1">New password</label>
                                            <input
                                                type="password"
                                                value={securityData.new_password}
                                                onChange={(e) => setSecurityData(prev => ({ ...prev, new_password: e.target.value }))}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs text-slate-500 ml-1">Confirm new password</label>
                                            <input
                                                type="password"
                                                value={securityData.confirm_password}
                                                onChange={(e) => setSecurityData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                        <Fingerprint className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed pr-8">
                                        By updating your access vector, all current sessions on other institutional devices will be terminated for security compliance.
                                    </p>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordMutation.isPending}
                                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 disabled:opacity-50 group"
                                    >
                                        {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 text-emerald-400 transition-transform" />}
                                        Update Access Protocols
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab: PREFERENCES */}
                        {activeTab === 'PREFERENCES' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-200">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-slate-900">Preferences</h3>
                                    <p className="text-xs text-slate-500">Notifications and regional settings</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#7c3aed] shadow-sm transition-all">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 mb-1">Email alerts</p>
                                                <p className="text-[11px] text-slate-500">Get an email when something important happens</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 cursor-pointer hover:bg-emerald-100 transition-colors">
                                            <div className="h-6 w-6 rounded-full bg-white shadow-sm translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm transition-all">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 mb-1">Auto time zone & currency</p>
                                                <p className="text-[11px] text-slate-500">Use your branch's time zone and currency</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-emerald-500 cursor-pointer">
                                            <div className="h-6 w-6 rounded-full bg-white shadow-sm translate-x-7 transition-transform" />
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
