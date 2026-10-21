import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortalMe } from '../../services/portal';
import {
    Bell,
    Search,
    AlertCircle,
    CreditCard,
    FileText,
    MessageSquare,
    Clock,
    MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { PortalNotification } from '../../services/portal';

const PortalNotifications: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-24 bg-white rounded-[2rem]" />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-white rounded-2xl" />
                ))}
            </div>
        );
    }

    const notifications = data?.notifications ?? [];

    const filteredNotifications = notifications.filter((n: PortalNotification) => {
        const matchesTab = activeTab === 'ALL' || n.category === activeTab;
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'ACTION': return <AlertCircle className="w-4 h-4" />;
            case 'PAYMENT': return <CreditCard className="w-4 h-4" />;
            case 'DOCUMENT': return <FileText className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'ACTION': return "bg-red-50 text-red-600";
            case 'PAYMENT': return "bg-emerald-50 text-emerald-600";
            case 'DOCUMENT': return "bg-blue-50 text-blue-600";
            default: return "bg-slate-50 text-slate-600";
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Filters */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 font-serif">Notification Center</h1>
                        <p className="text-slate-500 font-medium">Stay updated with your application journey and action items.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-6 text-sm font-bold focus:border-purple-200 outline-none transition-all w-64"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['ALL', 'INFO', 'ACTION', 'PAYMENT', 'DOCUMENT'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((n: PortalNotification) => (
                        <motion.div
                            key={n.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={clsx(
                                "bg-white p-6 rounded-[2rem] border transition-all flex gap-6 relative group",
                                n.read_at ? "border-slate-100 opacity-80" : "border-purple-100 shadow-[0_10px_30px_rgba(173,3,222,0.02)]"
                            )}
                        >
                            <div className={clsx(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                getCategoryStyles(n.category)
                            )}>
                                {getCategoryIcon(n.category)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-black text-slate-900">{n.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                        <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
                                    {n.message}
                                </p>
                                {!n.read_at && (
                                    <div className="mt-4 flex items-center gap-4">
                                        <button className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1 hove:underline">
                                            Mark as read
                                        </button>
                                        {n.category === 'ACTION' && (
                                            <button className="text-[10px] font-black text-white bg-slate-900 rounded-lg px-4 py-1.5 uppercase tracking-widest hover:bg-purple-700 transition-colors">
                                                Take Action
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!n.read_at && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-purple-600 rounded-r-full" />
                            )}
                        </motion.div>
                    )) : (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-8 h-8 text-slate-200" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900">No notifications found</h2>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                                Everything looks clear! We'll alert you here when there's an update on your applications.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Support */}
            <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-200">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black mb-1">Stay Connected</h3>
                            <p className="text-indigo-300 text-sm font-medium">Download our mobile app to receive instant push notifications.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 h-12 bg-white text-indigo-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 transition-transform">
                            App Store
                        </button>
                        <button className="px-6 h-12 bg-white text-indigo-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 transition-transform">
                            Google Play
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalNotifications;
