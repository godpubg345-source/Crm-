import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-[#f6f7f9]">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 overflow-y-auto premium-scrollbar">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );

};

export default DashboardLayout;
