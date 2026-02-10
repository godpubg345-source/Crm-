import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditAction } from '../services/auditLogs';
import { getBranches, type Branch } from '../services/auth';
import { Loader2, Search, AlertCircle } from 'lucide-react';

// ============================================================================
// AUDIT LOGS PAGE - BWBS Education CRM
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-slate-50/10 gap-8 animate-pulse p-12 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#AD03DE]/5 blur-[100px] rounded-full" />
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-100 relative z-10">
                <Loader2 className="w-10 h-10 animate-spin text-[#AD03DE]" strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] relative z-10 opacity-70">Synchronizing Audit Intelligence</p>
        </div>
    );

    return (
        <div className="space-y-14 animate-in fade-in duration-1000 ease-out pb-24 relative">
            {/* Ambient Accent Overlay */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[140px] rounded-full -ml-80 -mt-80 pointer-events-none" />

            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10 px-1">
                <div className="space-y-3">
                    <div className="flex items-center gap-5">
                        <div className="w-1.5 h-12 bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-900 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.2)]" />
                        <h1 className="text-6xl font-serif font-extrabold text-slate-900 tracking-tighter leading-none">Audit Protocol</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em] ml-7 opacity-60">System-wide activity • Compliance oversight • Security logs</p>
                </div>

                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Active Monitoring Matrix</span>
                </div>
            </div>

            {/* Tactical Filtering Grid */}
            <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[3rem] p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.06)] relative z-10">
                <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 opacity-70">Protocol Action</label>
                    <select
                        value={action}
                        onChange={(e) => { setAction(e.target.value as AuditAction | ''); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 uppercase tracking-widest focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                        <option value="">Global Actions</option>
                        <option value="CREATE">Induction (Create)</option>
                        <option value="UPDATE">Modification (Update)</option>
                        <option value="DELETE">Purge (Delete)</option>
                    </select>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 opacity-70">Entity Model</label>
                    <input
                        value={model}
                        onChange={(e) => { setModel(e.target.value); setPage(1); }}
                        placeholder="ENTITY TYPE..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 uppercase tracking-widest placeholder:text-slate-200 focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-2.5 lg:col-span-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 opacity-70">Search Keywords</label>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" strokeWidth={2.5} />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="SEARCH CRITERIA..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 uppercase tracking-widest placeholder:text-slate-200 focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all shadow-inner"
                        />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 opacity-70">Branch Node</label>
                    <select
                        value={branch}
                        onChange={(e) => { setBranch(e.target.value); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 uppercase tracking-widest focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                        <option value="">Universal Context</option>
                        {branches.map((b: Branch) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 opacity-70">Temporal Sequence</label>
                    <select
                        value={ordering}
                        onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] font-bold text-slate-900 uppercase tracking-widest focus:ring-4 focus:ring-[#AD03DE]/5 focus:border-[#AD03DE]/30 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                        <option value="-created_at">Chronological (Newest)</option>
                        <option value="created_at">Historical (Oldest)</option>
                        <option value="model">Entity Sorting</option>
                        <option value="action">Action Sorting</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6 relative z-10 ps-1 pr-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/40 border border-slate-100 rounded-[2rem] animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center py-24 bg-rose-50/20 backdrop-blur-xl border border-rose-100/50 rounded-[3rem] relative z-10 mx-1">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-rose-50 text-rose-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-500 mb-2">Interface Failure</p>
                    <p className="text-sm text-rose-400 font-medium font-bold">Failed to securely fetch audit intelligence.</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-32 bg-slate-50/40 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-slate-200/50 shadow-inner relative z-10 mx-1">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100 text-slate-300">
                        <Search className="w-10 h-10" strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-serif font-extrabold text-slate-900 mb-3">Historical Void</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed opacity-70">
                        No activity artifacts matched your tactical parameters. Redefine keywords or filters to explore the archives.
                    </p>
                </div>
            ) : (
                <div className="space-y-6 relative z-10 ps-1 pr-6 pb-12">
                    {logs.map((log) => (
                        <div key={log.id} className="group bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-100/80 rounded-[2.5rem] p-7 transition-all duration-700 hover:shadow-[0_32px_80px_-24px_rgba(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden">
                            {/* Accent Decoration */}
                            <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none rounded-full ${actionColors[log.action].split(' ')[0]}`} />

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className={`px-4 py-2 text-[9px] font-extrabold rounded-xl border-2 uppercase tracking-[0.2em] shadow-sm shrink-0 transition-transform duration-700 group-hover:scale-105 ${actionColors[log.action]}`}>
                                        {log.action}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-serif font-extrabold text-slate-900 group-hover:text-[#AD03DE] transition-colors truncate">
                                            {log.model} Protocol Execution
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="text-[10px] font-mono font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-2 py-0.5 rounded-md border border-[#AD03DE]/10 font-bold">
                                                {log.object_repr || log.object_id || 'System Asset'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                {log.method} • {log.path}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                    <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-100/50 px-4 py-2 rounded-2xl shadow-sm group-hover:bg-white transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-inner flex items-center justify-center border border-slate-50 ring-2 ring-[#AD03DE]/5">
                                            <span className="text-[#AD03DE] font-serif font-extrabold text-sm">{log.actor_details?.first_name?.[0] || 'S'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 group-hover:text-[#AD03DE] transition-colors">{log.actor_details ? `${log.actor_details.first_name} ${log.actor_details.last_name}` : 'System Protocol'}</span>
                                            <span className="text-[7px] text-slate-300 tracking-[0.3em] font-mono">{log.actor_details?.role || 'CORE_SYSTEM'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 px-4 py-2 bg-[#AD03DE]/5 border border-[#AD03DE]/10 rounded-2xl">
                                        <span className="text-[#AD03DE] leading-none mb-1">Target Node: {log.branch_details?.name || 'Global Intelligence'}</span>
                                        <span className="text-[7px] text-[#AD03DE]/60 opacity-60">
                                            {new Date(log.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {log.changes && Object.keys(log.changes).length > 0 && (
                                <details className="mt-8 group/payload">
                                    <summary className="cursor-pointer text-[9px] font-bold text-[#AD03DE] uppercase tracking-[0.4em] hover:text-[#9302bb] transition-all list-none flex items-center gap-3 w-fit bg-[#AD03DE]/5 px-4 py-1.5 rounded-full border border-[#AD03DE]/10 active:scale-95">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#AD03DE] group-hover/payload:animate-ping" />
                                        Inspect Data Payload
                                    </summary>
                                    <div className="mt-5 relative">
                                        <div className="absolute top-4 right-4 text-[8px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">JSON Manifest</div>
                                        <pre className="text-[11px] text-slate-600 bg-slate-900/5 backdrop-blur-sm border border-slate-200/50 rounded-[2rem] p-8 shadow-inner leading-relaxed font-mono overflow-auto custom-scrollbar max-h-96">
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
                            <div className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Volume: </span>
                                <span className="text-sm font-serif font-extrabold text-slate-900">{data?.count}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Operational Archives</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={!data?.previous}
                                className="px-8 py-3.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white border border-slate-100 rounded-2xl disabled:opacity-30 transition-all hover:bg-[#AD03DE] hover:text-white hover:border-[#AD03DE] shadow-xl shadow-slate-200/5 active:scale-95"
                            >
                                Decrypt Previous
                            </button>
                            <div className="px-4 py-2 bg-[#AD03DE] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#AD03DE]/20">{page}</div>
                            <button
                                onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={!data?.next}
                                className="px-8 py-3.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white border border-slate-100 rounded-2xl disabled:opacity-30 transition-all hover:bg-[#AD03DE] hover:text-white hover:border-[#AD03DE] shadow-xl shadow-slate-200/5 active:scale-95"
                            >
                                Decrypt Sequential
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
