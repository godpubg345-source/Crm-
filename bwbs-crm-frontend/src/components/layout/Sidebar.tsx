import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/bwbs-logo.png';
import {
    LayoutDashboard,
    Users,
    FileText,
    BadgeDollarSign,
    MessageSquare,
    ShieldAlert,
    LogOut,
    Globe,
    CalendarCheck,
    BookOpen,
    Stamp,
    Building,
    Settings as SettingsIcon,
    Filter,
    Megaphone,
    ArrowUpRight,
    Zap,
    Calendar,
    ShieldCheck,
    Map
} from 'lucide-react';
import { getCurrentUser, logout } from '../../services/auth';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const location = useLocation();
    const user = getCurrentUser();

    const navigation = [
        {
            title: "General",
            items: [
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
                { name: 'Tasks', href: '/tasks', icon: CalendarCheck },
                { name: 'Students', href: '/students', icon: Users },
                { name: 'Applications', href: '/applications', icon: FileText },
            ]
        },
        {
            title: "Analytics",
            items: [
                { name: 'Targets', href: '/predictive-analytics', icon: ArrowUpRight },
                { name: 'Reviews & SLA', href: '/reviews', icon: FileText },
                { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert },
            ]
        },
        {
            title: "Operations",
            items: [
                { name: 'Operations Hub', href: '/operations', icon: Zap },
                { name: 'Appointments', href: '/appointments', icon: Calendar },
                { name: 'Automation', href: '/automation', icon: SettingsIcon },
                { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
                { name: 'Visa Portal', href: '/visas', icon: Stamp },
            ]
        },
        {
            title: "Network",
            items: [
                { name: 'University Partners', href: '/partners', icon: Building },
                { name: 'Leads', href: '/leads', icon: Filter },
                { name: 'Marketing', href: '/marketing', icon: Megaphone },
            ]
        },
        {
            title: "Admin",
            items: [
                { name: 'Governance', href: '/governance', icon: Globe },
                { name: 'Resources', href: '/resources', icon: BookOpen },
                { name: 'Commissions', href: '/finance', icon: BadgeDollarSign },
                { name: 'Network & Branches', href: '/branches', icon: Map },
                { name: 'Messaging', href: '/messaging', icon: MessageSquare },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-surface-dark/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-white via-slate-50 to-purple-50/30 backdrop-blur-2xl border-r border-slate-200/80 shadow-[1px_0_20px_rgba(173,3,222,0.03)] transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col",
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Logo Area */}
                <div className="flex items-center justify-center pt-10 pb-6 px-6">
                    <img
                        src={logo}
                        alt="BWBS Education"
                        className="h-9 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                    />
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto premium-scrollbar">
                    {navigation.map((group, idx) => (
                        <div key={group.title || idx}>
                            {group.title !== "General" && (
                                <div className="px-4 mb-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80 pl-1">{group.title}</h3>
                                </div>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href + '/'));
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={clsx(
                                                "flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[13px] transition-all duration-300 group relative overflow-hidden",
                                                isActive
                                                    ? "bg-purple-50 text-[#AD03DE] shadow-sm font-extrabold ring-1 ring-purple-100/50"
                                                    : "text-slate-600 hover:text-[#AD03DE] hover:bg-purple-50/40 font-bold"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full shadow-[2px_0_10px_rgba(234,179,8,0.3)]" />
                                            )}
                                            <Icon className={clsx("w-4 h-4 transition-all duration-300", isActive ? "text-[#AD03DE] scale-110 drop-shadow-[0_0_8px_rgba(173,3,222,0.3)]" : "text-slate-400 group-hover:text-[#AD03DE] group-hover:scale-110")} />
                                            <span className="relative z-10">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-white transition-all group/user border border-transparent hover:border-slate-200 hover:shadow-sm"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#AD03DE] to-purple-800 ring-4 ring-white shadow-xl flex items-center justify-center text-white font-serif font-extrabold text-lg group-hover/user:rotate-3 transition-all duration-500">
                            {user?.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 truncate font-serif tracking-tight group-hover/user:text-[#AD03DE] transition-colors">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-tighter font-extrabold">{user?.role.replace('_', ' ')}</p>
                        </div>
                        <SettingsIcon className="w-4 h-4 text-slate-300 group-hover/user:text-[#AD03DE] transition-colors" />
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:text-slate-900 hover:bg-white hover:border-slate-300 rounded-xl transition-all border border-slate-200 active:scale-95 shadow-sm"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    );
};
