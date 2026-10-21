import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { empPortalLogout } from '../services/empPortal';
import clsx from 'clsx';
import logo from '../assets/bwbs-logo.png';

const navSections = [
    {
        label: 'HR',
        items: [
            { name: 'Dashboard', href: '/employee-portal', icon: LayoutDashboard },
            { name: 'Attendance', href: '/employee-portal/attendance', icon: Clock },
            { name: 'Leaves', href: '/employee-portal/leaves', icon: CalendarOff },
            { name: 'Payroll', href: '/employee-portal/payroll', icon: BadgeDollarSign },
        ],
    },
    {
        label: 'My Work',
        items: [
            { name: 'My Students', href: '/employee-portal/students', icon: GraduationCap },
            { name: 'Applications', href: '/employee-portal/applications', icon: FileStack },
            { name: 'Tasks', href: '/employee-portal/tasks', icon: ListTodo },
            { name: 'Leads', href: '/employee-portal/leads', icon: Users },
            { name: 'Visa Cases', href: '/employee-portal/visa-cases', icon: Stamp },
        ],
    },
    {
        label: 'Connect',
        items: [
            { name: 'Messages', href: '/employee-portal/messages', icon: MessageCircle },
            { name: 'Leaderboard', href: '/employee-portal/leaderboard', icon: Trophy },
        ],
    },
];

const EmpPortalLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        empPortalLogout();
        window.location.href = '/employee-portal/login';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-sm transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex-1 flex flex-col pt-8 pb-6 px-4 overflow-y-auto">
                    <div className="flex justify-center mb-6">
                        <img src={logo} alt="Education Consultancy ERP" className="h-8 w-auto px-4" />
                    </div>

                    <nav className="space-y-6 flex-1">
                        {navSections.map((section) => (
                            <div key={section.label}>
                                <div className="px-4 mb-2">
                                    <h3 className="text-xs font-semibold text-slate-400">{section.label}</h3>
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
                                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group",
                                                    isActive
                                                        ? "bg-teal-50 text-teal-700 shadow-sm"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
                                                )}
                                            >
                                                <Icon className={clsx(
                                                    "w-[18px] h-[18px] transition-transform",
                                                    isActive ? "text-teal-600" : "text-slate-400 group-hover:text-teal-500"
                                                )} />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden">
                    <img src={logo} alt="ERP Logo" className="h-6 w-auto" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmpPortalLayout;
