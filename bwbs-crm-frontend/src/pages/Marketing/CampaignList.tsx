// We can extend this later. For now, the dashboard has a list. 
// This file will be the full list view.
import { Search, Filter, MoreHorizontal } from 'lucide-react';

const CampaignList = () => {
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-bold text-slate-900">All Campaigns</h1>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search campaigns..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium flex items-center gap-2 hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Placeholder items */}
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">September Intake Blast</div>
                                <div className="text-xs text-slate-500">Email • 1,200 Recipients</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="flex gap-4">
                                    <div>
                                        <span className="block text-xs text-slate-400 font-bold uppercase">Open Rate</span>
                                        <span className="font-mono font-bold text-slate-700">45%</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-400 font-bold uppercase">Clicks</span>
                                        <span className="font-mono font-bold text-slate-700">12%</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                Running until <span className="font-medium text-slate-900">Oct 15</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">Webinar Invite - Canada</div>
                                <div className="text-xs text-slate-500">SMS • 300 Recipients</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Paused
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                                -
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                Starts <span className="font-medium text-slate-900">Tomorrow, 10:00 AM</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CampaignList;
