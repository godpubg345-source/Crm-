import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { empGetMyStudents } from '../../services/empPortal';
import {
    GraduationCap, Loader2, Mail, Phone, MapPin, Search,
    Award, ArrowRight, Sparkles, CheckCircle2, UserCheck
} from 'lucide-react';
import clsx from 'clsx';

const EmpStudents: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ENROLLED'>('ALL');

    const { data: students, isLoading } = useQuery({
        queryKey: ['myStudents'],
        queryFn: empGetMyStudents,
    });

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter((s: any) => {
            const matchesSearch =
                (s.full_name || `${s.first_name || ''} ${s.last_name || ''}`)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (s.student_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.nationality || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'ALL' || s.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, searchTerm, statusFilter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    const totalCount = students?.length || 0;
    const activeCount = students?.filter((s: any) => s.status === 'ACTIVE').length || 0;
    const enrolledCount = students?.filter((s: any) => s.status === 'ENROLLED').length || 0;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-teal-500" /> Counselor Portfolio
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">My Students</h1>
                    <p className="text-slate-500 font-medium">Manage student academic dossiers, test credentials, and applications.</p>
                </div>

                {/* Metrics Stats */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total</p>
                        <p className="text-2xl font-black font-serif text-slate-900">{totalCount}</p>
                    </div>
                    <div className="bg-teal-50/70 border border-teal-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-teal-600">Active</p>
                        <p className="text-2xl font-black font-serif text-teal-700">{activeCount}</p>
                    </div>
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl px-4 py-2.5 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Enrolled</p>
                        <p className="text-2xl font-black font-serif text-emerald-700">{enrolledCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by student name, code, email, or country..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {(['ALL', 'ACTIVE', 'ENROLLED'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={clsx(
                                "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all",
                                statusFilter === filter
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                            )}
                        >
                            {filter === 'ALL' ? 'All Students' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[2rem]">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 font-serif mb-1">No Students Found</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        {searchTerm ? 'Try changing your search term or filter.' : 'Students will appear here once assigned to you.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map((student: any) => {
                        const fullName = student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                        const initials = student.first_name && student.last_name
                            ? `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`
                            : fullName.substring(0, 2).toUpperCase();
                        const completeness = student.profile_completeness || 85;

                        return (
                            <Link
                                key={student.id}
                                to={`/employee-portal/students/${student.id}`}
                                className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all group flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Top row: Avatar + Name + Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-lg font-black font-serif shadow-md shadow-teal-100 group-hover:scale-105 transition-transform">
                                                {initials}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg group-hover:text-teal-600 transition-colors leading-tight">
                                                    {fullName}
                                                </h3>
                                                {student.student_code && (
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                                        {student.student_code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className={clsx(
                                            "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shrink-0",
                                            student.status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                student.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                                    'bg-slate-100 text-slate-600'
                                        )}>
                                            {student.status_display || student.status || 'Active'}
                                        </span>
                                    </div>

                                    {/* Tags: IELTS score & Nationality */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {student.english_test_score && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100">
                                                <Award className="w-3.5 h-3.5 text-violet-500" />
                                                {student.english_test_type || 'IELTS'} {student.english_test_score}
                                            </span>
                                        )}
                                        {student.nationality && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
                                                <MapPin className="w-3 h-3 text-slate-400" />
                                                {student.nationality}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-2 text-sm pt-2 border-t border-slate-50">
                                        {student.email && (
                                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                        )}
                                        {student.phone && (
                                            <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                                <span>{student.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Completeness Bar */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                            <span>Profile Completeness</span>
                                            <span className="text-teal-600 font-bold">{completeness}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${completeness}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer CTA */}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
                                    <span>Open Filing & Applications</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EmpStudents;
