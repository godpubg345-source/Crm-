import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudents, type Student } from '../services/students';
import AddStudentModal from '../components/AddStudentModal';
import {
    Search,
    UserPlus,
    Users,
    ChevronRight,
    Loader2,
    Navigation,
    Globe,
    CreditCard,
    X
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// STUDENTS REGISTRY - INSTITUTIONAL SCHOLAR DIRECTORY
// ============================================================================

const statusStyles: Record<Student['status'], { bg: string, text: string, border: string, dot: string }> = {
    ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-400' },
    ON_HOLD: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-400' },
    ENROLLED: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' },
    WITHDRAWN: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-400' },
};

const Students = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['students', page, search],
        queryFn: () => getStudents(page, search),
    });

    if (isLoading && !data) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-12">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Synchronizing Scholar Registry</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-12 animate-in fade-in duration-1000 ease-out pe-6 pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                        <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight leading-none">Scholar Registry</h1>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6 opacity-60">Strategic student directory • Academic lifecycle oversight</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#AD03DE]/10 focus-within:border-[#AD03DE]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Scholars..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-800 placeholder:text-slate-300 w-56 uppercase tracking-widest"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-2" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <UserPlus className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        Induct Scholar
                    </button>
                </div>
            </div>

            {/* Institutional Registry Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] overflow-hidden relative">
                {isError && (
                    <div className="p-20 text-center text-rose-500">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em]">Protocol Interrupted</h4>
                        <p className="text-[11px] font-serif font-bold text-slate-400 mt-2">{(error as Error)?.message || 'Database synchronization failure.'}</p>
                    </div>
                )}

                {!isError && data?.results?.length === 0 && (
                    <div className="p-20 text-center text-slate-300">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner group">
                            <Users className="w-12 h-12 text-slate-100 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Registry Empty</h4>
                        <p className="text-[11px] font-serif font-bold text-slate-300 mt-2">No scholarly entities matched the current query.</p>
                    </div>
                )}

                {!isError && data?.results && data.results.length > 0 && (
                    <>
                        <div className="premium-scrollbar overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">Intel Package</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">Passport Logistics</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">Regional Node</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">Deployment Status</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">Intelligence Completion</th>
                                        <th className="px-10 py-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.results.map((student) => {
                                        const styles = statusStyles[student.status] || statusStyles.ACTIVE;
                                        return (
                                            <tr
                                                key={student.id}
                                                onClick={() => navigate(`/students/${student.id}`)}
                                                className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                            >
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#AD03DE] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-[#AD03DE]/10 group-hover:rotate-6 transition-all duration-500">
                                                            {(student.first_name || '').charAt(0)}{(student.last_name || '').charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                to={`/students/${student.id}`}
                                                                className="text-xl font-serif font-bold text-slate-900 group-hover:text-[#AD03DE] transition-colors leading-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {student.first_name} {student.last_name}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Navigation className="w-3 h-3 text-slate-300" />
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-400 transition-colors border border-slate-100 group-hover:bg-white group-hover:shadow-sm">
                                                            <CreditCard className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest tabular-nums">
                                                            {student.passport_number || 'N/A PROTOCOL'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                                                        <Globe className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                            {student.branch_details?.code || 'X-NODE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-700",
                                                        styles.bg, styles.text, styles.border,
                                                        "group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                                                    )}>
                                                        <div className={clsx("w-1.5 h-1.5 rounded-full", styles.dot, "group-hover:bg-emerald-400 group-hover:animate-pulse")} />
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden max-w-[120px] border border-slate-100">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#AD03DE] to-indigo-600 rounded-full group-hover:animate-pulse"
                                                                style={{ width: `${student.profile_completeness}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">{student.profile_completeness}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#AD03DE] bg-white transition-all shadow-sm">
                                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Tactical Navigation Footer */}
                        <div className="px-12 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#AD03DE] shadow-xl border border-slate-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Authenticated Scholars</p>
                                    <p className="text-sm font-bold text-slate-900 font-mono tracking-tighter tabular-nums">{data.count} Registered Nodes</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!data.previous}
                                    className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 shadow-sm active:scale-95 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!data.next}
                                    className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 shadow-sm active:scale-95 flex items-center gap-3 group"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Students;
