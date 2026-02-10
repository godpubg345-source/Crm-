import { useQuery } from '@tanstack/react-query';
import { Plus, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import {
    getFixedAssets,
    getBranchComplaints,
    type FixedAsset,
    type BranchComplaint
} from '../../../services/branches';
import type { OperationsTabProps } from '../types';

const OperationsTab = ({ branchId, onAddAsset, onAddComplaint }: OperationsTabProps) => {
    const { data: assets } = useQuery<FixedAsset[]>({ queryKey: ['branch-assets', branchId], queryFn: () => getFixedAssets(branchId) });
    const { data: complaints } = useQuery<BranchComplaint[]>({ queryKey: ['branch-complaints', branchId], queryFn: () => getBranchComplaints(branchId) });

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Assets Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-serif font-black text-slate-900">Fixed Assets</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Property & Infrastructure Registry</p>
                        </div>
                        <button
                            onClick={onAddAsset}
                            className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-[#AD03DE] hover:bg-[#AD03DE] hover:text-white transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {assets?.length ? assets.map(asset => (
                            <div key={asset.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#AD03DE]/20 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#AD03DE]/5 group-hover:text-[#AD03DE] transition-colors">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{asset.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[9px] font-bold uppercase tracking-widest">
                                            <span className="text-slate-400">{asset.asset_tag || 'NO-TAG'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-indigo-500">{asset.category_display}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest",
                                        asset.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    )}>
                                        {asset.status_display}
                                    </div>
                                    <p className="text-[10px] font-mono font-bold text-slate-400 mt-2">Val: £{asset.current_value}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-64 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <Package className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No assets registered to this node</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Complaints Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-serif font-black text-slate-900">Complaints Log</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regional grievances & issue tracking</p>
                        </div>
                        <button
                            onClick={onAddComplaint}
                            className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                            <AlertCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {complaints?.length ? complaints.map(complaint => (
                            <div key={complaint.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className={clsx(
                                    "absolute top-0 left-0 w-1 h-full",
                                    complaint.priority === 'URGENT' ? "bg-rose-500" : "bg-indigo-500"
                                )} />
                                <div className="flex items-start justify-between mb-4">
                                    <h5 className="text-lg font-serif font-black text-slate-900 leading-tight group-hover:text-[#AD03DE] transition-colors">{complaint.subject}</h5>
                                    <span className={clsx(
                                        "px-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                        complaint.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 shadow-sm"
                                    )}>
                                        {complaint.status_display}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6">{complaint.description}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {complaint.created_by_name?.[0]}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {complaint.created_by_name}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-mono font-black text-slate-300">
                                        {new Date(complaint.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="h-64 rounded-[2.5rem] bg-emerald-50 border-2 border-dashed border-emerald-100 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">No active complaints in this territory</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsTab;
