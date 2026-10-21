import { motion } from 'framer-motion';
import {
    Megaphone,
    Mail,
    MessageSquare,
    Upload,
    PenLine,
    CheckCircle2,
    Smartphone,
    Plus,
    Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns, type Campaign } from '../../services/marketing';

const CHANNELS: { id: Campaign['channel']; name: string; icon: typeof Mail; color: string }[] = [
    { id: 'EMAIL', name: 'Email', icon: Mail, color: 'bg-blue-500' },
    { id: 'WHATSAPP', name: 'WhatsApp', icon: MessageSquare, color: 'bg-emerald-500' },
    { id: 'SMS', name: 'SMS', icon: Smartphone, color: 'bg-amber-500' },
];

const STATUS_STYLES: Record<Campaign['status'], string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    DRAFT: 'bg-slate-50 text-slate-600 border-slate-200',
    PAUSED: 'bg-amber-50 text-amber-700 border-amber-100',
    COMPLETED: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

const MarketingDashboard = () => {
    const { data: campaignData, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: getCampaigns
    });

    const campaigns: Campaign[] = campaignData?.results || [];
    const countBy = (status: Campaign['status']) => campaigns.filter((c) => c.status === status).length;

    const stats = [
        { label: 'Running', value: countBy('ACTIVE'), icon: Megaphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Drafts', value: countBy('DRAFT'), icon: PenLine, color: 'text-slate-600', bg: 'bg-slate-50' },
        { label: 'Completed', value: countBy('COMPLETED'), icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Campaigns', value: campaigns.length, icon: Megaphone, color: 'text-[#7c3aed]', bg: 'bg-purple-50' },
    ];

    const channelCounts = CHANNELS.map((ch) => ({
        ...ch,
        count: campaigns.filter((c) => c.channel === ch.id).length,
    }));

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Marketing Stats</h1>
                    <p className="text-sm text-slate-500 mt-1">Your campaigns by status and channel.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/admin/leads/import"
                        className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import Leads
                    </Link>
                    <Link
                        to="/admin/leads/campaigns/new"
                        className="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-[#6d28d9] transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white p-6 rounded-xl border border-slate-200 flex items-start justify-between"
                        >
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-2">{stat.label}</p>
                                <p className="text-3xl font-semibold text-slate-900">{isLoading ? '–' : stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaign list */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Recent Campaigns</h2>
                            <p className="text-xs text-slate-500 mt-1">Latest 5 campaigns</p>
                        </div>
                        <Link to="/admin/leads/campaigns" className="text-sm font-bold text-[#7c3aed] hover:underline">
                            View all
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-6"><div className="h-40 bg-slate-50 rounded-2xl animate-pulse" /></div>
                    ) : campaigns.length === 0 ? (
                        <div className="py-12 flex flex-col items-center text-center gap-3 text-slate-400">
                            <Inbox className="w-8 h-8" />
                            <p className="text-sm font-bold">No campaigns yet</p>
                            <Link to="/admin/leads/campaigns/new" className="text-sm font-bold text-[#7c3aed] hover:underline">
                                Create your first campaign
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Channel</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {campaigns.slice(0, 5).map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-slate-900">{campaign.name}</p>
                                            {campaign.target_group && <p className="text-xs text-slate-500">{campaign.target_group}</p>}
                                        </td>
                                        <td className="px-8 py-4 text-sm text-slate-600">
                                            {CHANNELS.find((ch) => ch.id === campaign.channel)?.name ?? campaign.channel}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[campaign.status] ?? STATUS_STYLES.DRAFT}`}>
                                                {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm text-slate-500">
                                            {new Date(campaign.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Channels */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-900">Channels</h2>
                    <p className="text-xs text-slate-500 mt-1 mb-8">Campaigns per channel</p>

                    <div className="space-y-6">
                        {channelCounts.map((ch) => {
                            const Icon = ch.icon;
                            const pct = campaigns.length ? Math.round((ch.count / campaigns.length) * 100) : 0;
                            return (
                                <div key={ch.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Icon className="w-4 h-4 text-slate-400" />
                                            {ch.name}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900">{ch.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard;
