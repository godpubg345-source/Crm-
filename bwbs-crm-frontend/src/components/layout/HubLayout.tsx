import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';

export interface HubTab {
    label: string;
    /** Absolute path, e.g. '/admin/leads/campaigns' */
    to: string;
    /** Match only the exact path (use for the hub's index tab) */
    end?: boolean;
}

interface HubLayoutProps {
    tabs: HubTab[];
}

export const PageLoader = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-24 w-full bg-slate-200/60 rounded-xl" />
        <div className="h-64 w-full bg-slate-200/60 rounded-xl" />
    </div>
);

/**
 * Groups related admin pages under one sidebar entry. Renders a tab strip
 * of sub-routes and the active page below it. Hidden when there's only one tab.
 */
const HubLayout = ({ tabs }: HubLayoutProps) => (
    <div className="space-y-6">
        {tabs.length > 1 && (
            <nav className="flex gap-6 border-b border-slate-200 overflow-x-auto premium-scrollbar">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) => clsx(
                            '-mb-px py-3 text-sm whitespace-nowrap border-b-2 transition-colors',
                            isActive
                                ? 'border-violet-600 text-violet-700 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 font-medium'
                        )}
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
        )}
        {/* Own boundary so the tab strip stays visible while a tab's page loads */}
        <Suspense fallback={<PageLoader />}>
            <Outlet />
        </Suspense>
    </div>
);

export default HubLayout;
