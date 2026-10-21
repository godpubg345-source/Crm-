import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudents, type Student } from '../../services/students';
import AddStudentModal from '../../components/AddStudentModal';
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
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse p-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs text-slate-500">Loading students...</p>
        </div>
    );

    return (
        <div className="p-1 lg:p-4 space-y-6 animate-in fade-in duration-200 ease-out pe-6 pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Students</h1>
                    </div>
                    <p className="text-xs text-slate-500 ml-6 opacity-60">All students and where they are in their journey</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-[1.75rem] border border-slate-200">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:ring-4 focus-within:ring-[#7c3aed]/10 focus-within:border-[#7c3aed]/30 transition-all">
                        <Search className="w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder:text-slate-300 w-56"
                        />
                    </div>
                    <div className="w-px h-10 bg-slate-100 mx-2" />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-3 group"
                    >
                        <UserPlus className="w-4 h-4 text-emerald-400 transition-transform" />
                        Add student
                    </button>
                </div>
            </div>

            {/* Institutional Registry Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative">
                {isError && (
                    <div className="p-20 text-center text-rose-500">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-xs font-bold">Couldn't load students</h4>
                        <p className="text-[11px] text-slate-500 mt-2">{(error as Error)?.message || 'Database synchronization failure.'}</p>
                    </div>
                )}

                {!isError && data?.results?.length === 0 && (
                    <div className="p-20 text-center text-slate-300">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group">
                            <Users className="w-12 h-12 text-slate-100 transition-transform duration-200" strokeWidth={1} />
                        </div>
                        <h4 className="text-xs text-slate-500">No students found</h4>
                        <p className="text-[11px] font-bold text-slate-300 mt-2">No students match your search.</p>
                    </div>
                )}

                {!isError && data?.results && data.results.length > 0 && (
                    <>
                        <div className="premium-scrollbar overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">Student</th>
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">Passport</th>
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">Branch</th>
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">Status</th>
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">Profile complete</th>
                                        <th className="px-6 py-8 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.results.map((student) => {
                                        const styles = statusStyles[student.status] || statusStyles.ACTIVE;
                                        return (
                                            <tr
                                                key={student.id}
                                                onClick={() => navigate(`/admin/students/${student.id}`)}
                                                className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                                            >
                                                <td className="px-6 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7c3aed] to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm transition-all duration-200">
                                                            {(student.first_name || '').charAt(0)}{(student.last_name || '').charAt(0)}
                                                        </div>
                                                        <div>
                                            <Link
                                                                to={`/admin/students/${student.id}`}
                                                                className="text-xl font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors leading-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {student.first_name} {student.last_name}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Navigation className="w-3 h-3 text-slate-300" />
                                                                <p className="text-xs font-medium text-slate-400">{student.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-rose-400 transition-colors border border-slate-100 group-hover:bg-white">
                                                            <CreditCard className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                                                            {student.passport_number || 'Not added'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-8">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl shadow-sm">
                                                        <Globe className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-xs font-bold text-white">
                                                            {student.branch_details?.code || 'X-NODE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-8">
                                                    <span className={clsx(
                                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold border transition-all duration-700",
                                                        styles.bg, styles.text, styles.border,
                                                        "group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                                                    )}>
                                                        <div className={clsx("w-1.5 h-1.5 rounded-full", styles.dot, "group-hover:bg-emerald-400 group-hover:animate-pulse")} />
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden max-w-[120px] border border-slate-100">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-[#7c3aed] to-indigo-600 rounded-full group-hover:animate-pulse"
                                                                style={{ width: `${student.profile_completeness}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-500 tabular-nums">{student.profile_completeness}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-8 text-right">
                                                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-[#7c3aed] bg-white transition-all">
                                                            <ChevronRight className="w-5 h-5 transition-transform" />
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
                        <div className="px-6 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#7c3aed] border border-slate-200">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 leading-none mb-1">students</p>
                                    <p className="text-sm font-bold text-slate-900 font-mono tracking-tight tabular-nums">{data.count} students</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!data.previous}
                                    className="px-8 py-3.5 text-xs text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!data.next}
                                    className="px-8 py-3.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 flex items-center gap-3 group"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 transition-transform" />
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
