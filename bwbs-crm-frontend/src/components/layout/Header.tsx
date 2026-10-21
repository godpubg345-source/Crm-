import { Menu } from 'lucide-react';
import { useBranch } from '../../hooks/useBranch';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface HeaderProps {
    setSidebarOpen: (isOpen: boolean) => void;
}

export const Header = ({ setSidebarOpen }: HeaderProps) => {
    const location = useLocation();
    const { selectedBranch, setSelectedBranch, branches, canSwitchBranch, fetchBranches } = useBranch();

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // Section name from the first segment after /admin
    const SECTION_TITLES: Record<string, string> = {
        dashboard: 'Dashboard',
        leads: 'Leads',
        students: 'Students',
        applications: 'Applications',
        universities: 'Universities',
        finance: 'Finance',
        team: 'Team & Branches',
        agents: 'Agents',
        settings: 'Settings',
    };

    const getPageTitle = () => {
        const section = location.pathname.split('/')[2] || 'dashboard';
        return SECTION_TITLES[section] ?? section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-30">
            <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-lg font-semibold text-slate-900 flex-1 tracking-tight">
                {getPageTitle()}
            </h1>

            {/* Branch Selector */}
            {canSwitchBranch && (
                <label className="flex items-center gap-2 text-sm">
                    <span className="hidden sm:inline text-slate-500">Branch</span>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="h-9 max-w-[150px] sm:max-w-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 cursor-pointer"
                    >
                        <option value="">All branches</option>
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </label>
            )}
        </header>
    );
};
