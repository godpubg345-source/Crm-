import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/bwbs-logo.png';
import {
    LayoutDashboard,
    Users,
    FileText,
    BadgeDollarSign,
    LogOut,
    Building,
    Settings as SettingsIcon,
    Filter,
    Map,
    Handshake
} from 'lucide-react';
import { getCurrentUser, logout } from '../../services/auth';
import { ENABLE_IMMIGRATION } from '../../config/features';
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
            title: "Overview",
            items: [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: "Pipeline",
            items: [
                { name: 'Leads', href: '/admin/leads', icon: Filter },
                { name: 'Students', href: '/admin/students', icon: Users },
                { name: ENABLE_IMMIGRATION ? 'Applications & Visas' : 'Applications', href: '/admin/applications', icon: FileText },
                { name: 'Universities', href: '/admin/universities', icon: Building },
            ]
        },
        {
            title: "Business",
            items: [
                { name: 'Finance', href: '/admin/finance', icon: BadgeDollarSign },
                { name: 'Team & Branches', href: '/admin/team', icon: Map },
                { name: 'Agents', href: '/admin/agents', icon: Handshake },
            ]
        },
        {
            title: "System",
            items: [
                { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={clsx(
                "fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white border-r border-slate-200 transition-transform duration-200 lg:translate-x-0",
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
                    <img src={logo} alt="" className="h-8 w-8 rounded-lg object-contain bg-violet-50 p-1" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">Education Consultancy ERP</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto premium-scrollbar">
                    {navigation.map((group, idx) => (
                        <div key={group.title || idx}>
                            <h3 className="px-3 mb-1 text-xs font-medium text-slate-400">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.href ||
                                        location.pathname.startsWith(item.href + '/');
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsOpen(false)}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={clsx(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                                isActive
                                                    ? "bg-violet-50 text-violet-700 font-semibold"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                                            )}
                                        >
                                            <Icon className={clsx("w-4 h-4 flex-shrink-0", isActive ? "text-violet-600" : "text-slate-400")} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-3 border-t border-slate-200">
                    <Link
                        to="/admin/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
                            {user?.first_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate capitalize">
                                {user?.role?.replace(/_/g, ' ').toLowerCase()}
                            </p>
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="mt-1 w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
};
