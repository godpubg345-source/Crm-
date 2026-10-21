import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditAction } from '../../services/auditLogs';
import { getBranches } from '../../services/auth';
import { type Branch } from '../../types';

import { Loader2, Search, AlertCircle } from 'lucide-react';

// ============================================================================
// AUDIT LOGS PAGE - Education Consultancy ERP
// ============================================================================

const actionColors: Record<AuditAction, string> = {
    CREATE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    UPDATE: 'bg-blue-50 text-blue-600 border-blue-100',
    DELETE: 'bg-red-50 text-red-600 border-red-100',
};

const AuditLogs = () => {
    const [action, setAction] = useState<AuditAction | ''>('');
    const [model, setModel] = useState('');
    const [search, setSearch] = useState('');
    const [branch, setBranch] = useState('');
    const [ordering, setOrdering] = useState('-created_at');
    const [page, setPage] = useState(1);

    const { data: branches = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });

    const { data, isLoading, isError } = useQuery({
        queryKey: ['audit-logs', action, model, search, branch, ordering, page],
        queryFn: () => getAuditLogs({ action, model, search, branch, ordering, page }),
    });

    const logs = data?.results || [];

    if (isLoading && !data) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-slate-50/10 gap-8 animate-pulse p-6 relative overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 relative z-10">
                <Loader2 className="w-10 h-10 animate-spin text-[#7c3aed]" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-slate-500 relative z-10 opacity-70">Loading audit logs...</p>
        </div>
    );

    return (
        <div className="space-y-14 animate-in fade-in duration-200 ease-out pb-24 relative">

            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10 px-1">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">Audit Logs</h1>
                    </div>
                    <p className="text-xs text-slate-500 ml-7 opacity-60">Who changed what, and when</p>
                </div>

                <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800">Recording</span>
                </div>
            </div>

            {/* Tactical Filtering Grid */}
            <div className="bg-white border border-white rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative z-10">
                <div className="space-y-2.5">
                    <label className="block text-[11px] text-slate-500 ml-2 opacity-70">Action</label>
                    <select
                        value={action}
                        onChange={(e) => { setAction(e.target.value as AuditAction | ''); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/30 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All actions</option>
                        <option value="CREATE">Created</option>
                        <option value="UPDATE">Updated</option>
                        <option value="DELETE">Deleted</option>
                    </select>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[11px] text-slate-500 ml-2 opacity-70">Record type</label>
                    <input
                        value={model}
                        onChange={(e) => { setModel(e.target.value); setPage(1); }}
                        placeholder="Record type..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/30 transition-all"
                    />
                </div>
                <div className="space-y-2.5 lg:col-span-1">
                    <label className="block text-[11px] text-slate-500 ml-2 opacity-70">Search</label>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" strokeWidth={2.5} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/30 transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[11px] text-slate-500 ml-2 opacity-70">Branch</label>
                    <select
                        value={branch}
                        onChange={(e) => { setBranch(e.target.value); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/30 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All branches</option>
                        {branches.map((b: Branch) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[11px] text-slate-500 ml-2 opacity-70">Sort by</label>
                    <select
                        value={ordering}
                        onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 focus:ring-4 focus:ring-[#7c3aed]/5 focus:border-[#7c3aed]/30 transition-all appearance-none cursor-pointer"
                    >
                        <option value="-created_at">Newest first</option>
                        <option value="created_at">Oldest first</option>
                        <option value="model">Record type</option>
                        <option value="action">Action</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6 relative z-10 ps-1 pr-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center py-12 bg-rose-50/20 border border-rose-100/50 rounded-2xl relative z-10 mx-1">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 border border-rose-50 text-rose-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-rose-500 mb-2">Something went wrong</p>
                    <p className="text-sm text-rose-400 font-medium font-bold">We couldn't load the audit logs. Please try again.</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/40 rounded-2xl border-2 border-dashed border-slate-200/50 relative z-10 mx-1">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-8 border border-slate-200 text-slate-300">
                        <Search className="w-10 h-10" strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">No results</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed opacity-70">
                        No activity matches your filters. Try different keywords or clear the filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-6 relative z-10 ps-1 pr-6 pb-12">
                    {logs.map((log) => (
                        <div key={log.id} className="group bg-white hover:bg-white border border-slate-100/80 rounded-2xl p-7 transition-all duration-200 relative overflow-hidden">
                            {/* Accent Decoration */}
                            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none rounded-full ${actionColors[log.action].split(' ')[0]}`} />

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className={`px-4 py-2 text-[11px] font-semibold rounded-xl border-2 shadow-sm shrink-0 transition-transform duration-700 ${actionColors[log.action]}`}>
                                        {log.action}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-semibold text-slate-900 group-hover:text-[#7c3aed] transition-colors truncate">
                                            {log.model}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="text-xs font-mono font-bold text-[#7c3aed] bg-[#7c3aed]/5 px-2 py-0.5 rounded-md border border-[#7c3aed]/10">
                                                {log.object_repr || log.object_id || 'System Asset'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                {log.method} • {log.path}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500">
                                    <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-100/50 px-4 py-2 rounded-2xl shadow-sm group-hover:bg-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 ring-2 ring-[#7c3aed]/5">
                                            <span className="text-[#7c3aed] font-semibold text-sm">{log.actor_details?.first_name?.[0] || 'S'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 group-hover:text-[#7c3aed] transition-colors">{log.actor_details ? `${log.actor_details.first_name} ${log.actor_details.last_name}` : 'System'}</span>
                                            <span className="text-[11px] text-slate-300 font-mono">{log.actor_details?.role || 'CORE_SYSTEM'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 px-4 py-2 bg-[#7c3aed]/5 border border-[#7c3aed]/10 rounded-2xl">
                                        <span className="text-[#7c3aed] leading-none mb-1">To branch: {log.branch_details?.name || 'All branches'}</span>
                                        <span className="text-[11px] text-[#7c3aed]/60 opacity-60">
                                            {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {log.changes && Object.keys(log.changes).length > 0 && (
                                <details className="mt-8 group/payload">
                                    <summary className="cursor-pointer text-[11px] font-bold text-[#7c3aed] hover:text-[#9302bb] transition-all list-none flex items-center gap-3 w-fit bg-[#7c3aed]/5 px-4 py-1.5 rounded-full border border-[#7c3aed]/10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] group-hover/payload:animate-ping" />
                                        View changes
                                    </summary>
                                    <div className="mt-5 relative">
                                        <div className="absolute top-4 right-4 text-[11px] font-bold text-slate-300 pointer-events-none">Raw data</div>
                                        <pre className="text-[11px] text-slate-600 bg-slate-900/5 border border-slate-200/50 rounded-2xl p-6 leading-relaxed font-mono overflow-auto custom-scrollbar max-h-96">
                                            {JSON.stringify(log.changes, null, 2)}
                                        </pre>
                                    </div>
                                </details>
                            )}
                        </div>
                    ))}

                    {/* Pagination Interface */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100/50">
                        <div className="flex items-center gap-4">
                            <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl">
                                <span className="text-xs text-slate-500">Volume: </span>
                                <span className="text-sm font-semibold text-slate-900">{data?.count}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <span className="text-[11px] font-bold text-slate-300">Logs</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={!data?.previous}
                                className="px-8 py-3.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]"
                            >
                                Previous
                            </button>
                            <div className="px-4 py-2 bg-[#7c3aed] text-white rounded-xl text-xs font-bold shadow-sm">{page}</div>
                            <button
                                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={!data?.next}
                                className="px-8 py-3.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-30 transition-all hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
