import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Bell,
    LogOut,
    Menu,
    CreditCard,
    Plane,
    X,
    GraduationCap,
    Sparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { portalLogout, getPortalMe, isPortalAuthenticated } from '../../services/portal';
import clsx from 'clsx';
import logo from '../../assets/bwbs-logo.png';
import { getCurrentUser } from '../../services/auth';

const navigation = [
    { name: 'My Dashboard', href: '/portal', icon: LayoutDashboard, exact: true },
    { name: 'My Applications', href: '/portal/applications', icon: FileText },
    { name: 'Document Vault', href: '/portal/documents', icon: FolderOpen },
    { name: 'Visa Tracker', href: '/portal/visa', icon: Plane },
    { name: 'Payments', href: '/portal/payments', icon: CreditCard },
    { name: 'Notifications', href: '/portal/notifications', icon: Bell },
];

const PortalLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const user = getCurrentUser();

    const { data: portalData } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
        enabled: isPortalAuthenticated(),
    });

    const student = portalData?.student;
    const displayName = student?.full_name || (user ? `${user.first_name} ${user.last_name}` : 'Priya Sharma');
    const initial = displayName.charAt(0) || 'S';

    const handleLogout = async () => {
        await portalLogout();
        window.location.href = '/portal/login';
    };

    return (
        <div className="min-h-screen flex bg-[#f0eef8] selection:bg-purple-400/20 selection:text-purple-700">
            {/* Fixed ambient blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#AD03DE]/6 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-60 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── STUDENT SIDEBAR ──────────────────────────────────── */}
            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0",
                "bg-white border-r border-slate-200/80 shadow-[4px_0_40px_rgba(0,0,0,0.06)]",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Gradient top strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#AD03DE] via-indigo-500 to-transparent" />

                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#AD03DE] to-indigo-600 flex items-center justify-center shadow-lg shadow-[#AD03DE]/25">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-900 font-black text-sm">Student Portal</p>
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">Education Consultancy</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Student info card */}
                <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#AD03DE]/8 to-indigo-600/5 border border-[#AD03DE]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#AD03DE] to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md">
                            {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 truncate">{displayName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Sparkles className="w-3 h-3 text-[#AD03DE]" />
                                <p className="text-[9px] text-[#AD03DE] font-black uppercase tracking-widest">Active Student</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] px-3 pb-3">Navigation</p>
                    {navigation.map((navItem) => {
                        const isActive = navItem.exact
                            ? location.pathname === navItem.href
                            : location.pathname === navItem.href || location.pathname.startsWith(navItem.href + '/');
                        const Icon = navItem.icon;
                        return (
                            <Link
                                key={navItem.name}
                                to={navItem.href}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-[#AD03DE]/10 text-[#AD03DE] font-black border border-[#AD03DE]/15 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-[#AD03DE] to-indigo-500 rounded-r-full" />
                                )}
                                <Icon className={clsx("w-4 h-4 flex-shrink-0", isActive ? "text-[#AD03DE]" : "text-slate-400 group-hover:text-slate-600")} />
                                {navItem.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#AD03DE] to-indigo-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-900 font-black text-sm">Student Portal</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-800">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                <footer className="px-8 py-3 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.25em]">
                        Student Portal • Secure Access
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PortalLayout;
