import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Clock,
    CalendarOff,
    BadgeDollarSign,
    LogOut,
    Menu,
    GraduationCap,
    FileStack,
    ListTodo,
    Users,
    Stamp,
    MessageCircle,
    Trophy,
    Building2,
    ArrowLeftRight,
    Sparkles,
} from 'lucide-react';
import { empPortalLogout, empGetMyProfile } from '../../services/empPortal';
import { ENABLE_IMMIGRATION } from '../../config/features';
import clsx from 'clsx';
import logo from '../../assets/bwbs-logo.png';

const navSections = [
    {
        label: 'HR & Administration',
        items: [
            { name: 'Dashboard', href: '/employee-portal', icon: LayoutDashboard },
            { name: 'Attendance', href: '/employee-portal/attendance', icon: Clock },
            { name: 'Leaves', href: '/employee-portal/leaves', icon: CalendarOff },
            { name: 'Payroll', href: '/employee-portal/payroll', icon: BadgeDollarSign },
        ],
    },
    {
        label: 'Counseling & Admissions',
        items: [
            { name: 'My Students', href: '/employee-portal/students', icon: GraduationCap },
            { name: 'Applications', href: '/employee-portal/applications', icon: FileStack },
            { name: 'Tasks', href: '/employee-portal/tasks', icon: ListTodo },
            { name: 'Leads', href: '/employee-portal/leads', icon: Users },
            ...(ENABLE_IMMIGRATION ? [{ name: 'Visa Cases', href: '/employee-portal/visa-cases', icon: Stamp }] : []),
        ],
    },
    {
        label: 'Team & Collaboration',
        items: [
            { name: 'Messages', href: '/employee-portal/messages', icon: MessageCircle },
            { name: 'Leaderboard', href: '/employee-portal/leaderboard', icon: Trophy },
        ],
    },
];

const EmpPortalLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const { data: profile } = useQuery({
        queryKey: ['myProfile'],
        queryFn: empGetMyProfile,
    });

    const handleLogout = () => {
        empPortalLogout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-100/70 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Premium Dark Navigation Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0B1322] via-[#09101C] to-[#060B14] border-r border-slate-800/80 shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex-1 flex flex-col pt-7 pb-6 px-4 overflow-y-auto">
                    {/* Logo Header */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="bg-white/95 rounded-2xl p-2.5 shadow-md shadow-black/20 w-full flex items-center justify-center border border-white/20">
                            <img src={logo} alt="Education Consultancy ERP" className="h-7 w-auto" />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-6 flex-1">
                        {navSections.map((section) => (
                            <div key={section.label}>
                                <div className="px-3 mb-2 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.label}</h3>
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = location.pathname === item.href ||
                                            (item.href !== '/employee-portal' && location.pathname.startsWith(item.href + '/'));
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={clsx(
                                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative",
                                                    isActive
                                                        ? "bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-transparent text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-950/40"
                                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                                )}
                                            >
                                                <Icon className={clsx(
                                                    "w-4 h-4 transition-transform group-hover:scale-110",
                                                    isActive ? "text-teal-400" : "text-slate-400 group-hover:text-slate-300"
                                                )} />
                                                <span className="truncate">{item.name}</span>
                                                {isActive && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 ml-auto shadow-[0_0_8px_#2dd4bf]" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Counselor Quick Profile Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-800/80">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
                                {profile?.first_name?.charAt(0) || 'S'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">
                                    {profile ? `${profile.first_name} ${profile.last_name}` : 'Sarah Jenkins'}
                                </p>
                                <p className="text-[10px] text-teal-400 font-medium truncate">London Central Counselor</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Desktop Top Header with Glass Effect */}
                <header className="hidden lg:flex h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 items-center justify-between px-8 sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-800">Shift Active</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>London Main Branch</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-[#AD03DE]" />
                            <span>Switch Portal</span>
                        </Link>

                        <div className="h-6 w-px bg-slate-200" />

                        <div className="flex items-center gap-3 pl-1">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-md">
                                {profile?.first_name?.charAt(0) || 'S'}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-slate-900 leading-tight">
                                    {profile ? `${profile.first_name} ${profile.last_name}` : 'Sarah Jenkins'}
                                </p>
                                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">
                                    Senior Counselor
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:hidden text-white">
                    <img src={logo} alt="ERP Logo" className="h-6 w-auto bg-white p-1 rounded" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-300 hover:bg-white/10 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto w-full bg-gradient-to-br from-slate-100/90 via-slate-50 to-blue-50/40">
                    <div className="min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmpPortalLayout;
