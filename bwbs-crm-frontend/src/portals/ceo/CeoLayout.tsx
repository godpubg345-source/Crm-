import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Globe,
    Users,
    BadgeDollarSign,
    LogOut,
    Menu,
    X,
    Briefcase,
    BarChart3,
} from 'lucide-react';
import { logout } from '../../services/auth';
import { getCurrentUser } from '../../services/auth';
import clsx from 'clsx';
import logo from '../../assets/bwbs-logo.png';

const navigation = [
    { name: 'Executive Dashboard', href: '/ceo/dashboard', icon: LayoutDashboard },
    { name: 'Revenue Intelligence', href: '/ceo/revenue', icon: BadgeDollarSign },
    { name: 'Global Performance', href: '/ceo/performance', icon: BarChart3 },
    { name: 'Branch Network', href: '/ceo/branches', icon: Globe },
    { name: 'Workforce Analytics', href: '/ceo/workforce', icon: Users },
    { name: 'Growth Forecast', href: '/ceo/forecast', icon: TrendingUp },
    { name: 'Strategic Reports', href: '/ceo/reports', icon: Briefcase },
];

const CeoLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const user = getCurrentUser();

    return (
        <div className="min-h-screen flex bg-[#050810] text-white selection:bg-amber-400/20 selection:text-amber-200">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── CEO SIDEBAR ───────────────────────────────────────── */}
            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-full w-72 flex flex-col transition-transform duration-300 lg:translate-x-0",
                "border-r border-white/[0.06]",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
                style={{
                    background: "linear-gradient(160deg, #0d0a1a 0%, #050810 60%, #060d1f 100%)"
                }}
            >
                {/* Ambient effects */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10 flex items-center justify-between p-8 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <img src={logo} alt="ERP Logo" className="h-6 w-auto object-contain brightness-0" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight">CEO Suite</p>
                            <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.25em]">Executive Intelligence</p>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-3 py-3">
                        Executive Modules
                    </p>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-amber-500/15 text-amber-300 font-black border border-amber-500/25"
                                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.05] font-semibold"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-amber-400 rounded-r-full shadow-[2px_0_12px_rgba(251,191,36,0.6)]" />
                                )}
                                <Icon className={clsx(
                                    "w-4 h-4 flex-shrink-0",
                                    isActive ? "text-amber-400" : "text-white/25 group-hover:text-white/60"
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="relative z-10 p-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-base shadow-lg">
                            {user?.first_name?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white/90 truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-[9px] text-amber-400/70 uppercase tracking-widest font-bold truncate">Chief Executive</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.05] hover:border-rose-500/20 transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
                {/* Mobile header */}
                <header className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#050810]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <img src={logo} alt="ERP Logo" className="h-4 w-auto brightness-0" />
                        </div>
                        <span className="text-white font-black text-sm">CEO Suite</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="text-white/40 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-5 lg:p-8">
                    <Outlet />
                </main>

                <footer className="px-8 py-3 border-t border-white/[0.04]">
                    <p className="text-[9px] font-black text-white/15 uppercase tracking-[0.3em]">
                        Executive Intelligence Suite • Confidential
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default CeoLayout;
