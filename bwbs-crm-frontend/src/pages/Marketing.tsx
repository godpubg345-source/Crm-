import { motion } from 'framer-motion';
import {
    Megaphone,
    TrendingUp,
    Users,
    Mail,
    MessageSquare,
    Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketingDashboard = () => {
    const stats = [
        { label: 'Active Campaigns', value: '3', icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Reach', value: '1,240', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Engagement Rate', value: '12.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Pending Msgs', value: '45', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Marketing Command Center</h1>
                    <p className="text-slate-500 mt-1">Manage campaigns, track reach, and engage with students.</p>
                </div>
                <Link
                    to="/marketing/campaigns/new"
                    className="px-6 py-3 bg-[#AD03DE] text-white rounded-xl font-medium shadow-lg hover:bg-[#8a02b3] transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Campaign
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Campaigns Preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Recent Campaigns</h2>
                    <Link to="/marketing/campaigns" className="text-sm text-[#AD03DE] font-medium hover:underline">View All</Link>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reach</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                            MK
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">UK Intake Push {i}</p>
                                            <p className="text-xs text-slate-500">Created 2 days ago</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                    450 Students
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-[#AD03DE] transition-colors">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketingDashboard;
