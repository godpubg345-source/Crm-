import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex selection:bg-purple-500/20 selection:text-purple-700">
            {/* Ambient Background Elements - More Vibrant */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-[#AD03DE]/10 to-purple-400/5 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-tr from-indigo-500/10 to-[#AD03DE]/5 blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-yellow-400/5 blur-[80px] rounded-full animate-pulse [animation-delay:4s]" />
            </div>

            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 lg:pl-64 relative z-10 h-screen overflow-hidden">
                {/* Headers */}
                <Header setSidebarOpen={setSidebarOpen} />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-10 overflow-y-auto premium-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>

                <footer className="px-10 py-6 border-t border-slate-100/50 bg-white/30 backdrop-blur-sm">
                    <p className="text-[9px] font-extrabold text-slate-300 uppercase tracking-[0.3em]">BWBS Intelligence Protocol • v2.4.0 • Strategic Compliance Active</p>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
