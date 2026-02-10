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

    // Simplistic title mapping (could be improved)
    const getPageTitle = () => {
        const path = location.pathname.split('/')[1];
        if (!path || path === 'dashboard') return 'Executive Dashboard';
        if (path === 'finder') return 'Discovery Hub';
        if (path === 'visas') return 'Visa Management';
        if (path === 'pipeline') return 'Application Pipeline';
        if (path === 'finance') return 'Financial Intelligence';
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };

    return (
        <header className="h-20 bg-gradient-to-r from-white/80 via-white/70 to-purple-50/50 backdrop-blur-2xl border-b border-slate-200/60 flex items-center px-6 lg:px-10 sticky top-0 z-30 transition-all duration-300 shadow-[0_1px_3px_rgba(173,3,222,0.03)]">
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 text-slate-400 hover:text-[#AD03DE] hover:bg-slate-50 rounded-xl transition-all active:scale-90"
            >
                <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-2xl font-serif font-extrabold text-slate-900 ml-3 lg:ml-0 flex-1 tracking-tight">
                {getPageTitle()}
            </h1>

            {/* Branch Selector */}
            {canSwitchBranch && (
                <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm hover:border-[#AD03DE]/30 transition-all group">
                    <div className="flex flex-col">
                        <span className="hidden sm:inline text-[9px] font-extrabold text-slate-600 uppercase tracking-[0.2em] leading-none mb-1">Active Branch</span>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="bg-transparent border-none text-slate-900 text-sm focus:ring-0 cursor-pointer font-extrabold p-0 leading-none h-auto"
                        >
                            <option value="" className="bg-white text-slate-900">Global View</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id} className="bg-white text-slate-900">
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </header>
    );
};
