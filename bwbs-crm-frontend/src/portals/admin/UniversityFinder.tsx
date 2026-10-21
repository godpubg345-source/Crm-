import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses, type CourseFilterParams } from '../../services/universities';
import {
    Search,
    MapPin,
    GraduationCap,
    Globe,
    ChevronRight,
    RotateCcw,
    Building,
    Clock,
    X
} from 'lucide-react';

// ============================================================================
// UNIVERSITY & COURSE FINDER - SCHOLARLY PARTNER HUB
// ============================================================================

const UniversityFinder = () => {
    const [filters, setFilters] = useState<CourseFilterParams>({
        page: 1,
        search: '',
        country: '',
        level: '',
        max_price: 50000,
    });

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['courses', filters],
        queryFn: () => getCourses(filters),
        placeholderData: (previousData) => previousData,
    });

    const handleFilterChange = (key: keyof CourseFilterParams, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const formatCurrency = (amount?: number, currency = 'GBP') => {
        if (!amount) return 'TBD';
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-8 animate-in fade-in duration-200 ease-out pe-6 pb-4">

            {/* Lead details Sidebar */}
            <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 overflow-y-auto premium-scrollbar relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

                <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-2">Universities</h3>
                    <p className="text-xs text-slate-500">Filters</p>
                </div>

                <div className="space-y-8 relative z-10">
                    {/* Search Field */}
                    <div className="space-y-3">
                        <label className="text-xs text-slate-500 ml-1">Search</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#7c3aed] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={debouncedSearch}
                                onChange={(e) => setDebouncedSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Regional Select */}
                    <div className="space-y-3">
                        <label className="text-xs text-slate-500 ml-1">Country</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-[#7c3aed] transition-colors" />
                            <select
                                value={filters.country}
                                onChange={(e) => handleFilterChange('country', e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All countries</option>
                                <option value="UK">United Kingdom</option>
                                <option value="USA">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">European Union</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-hover:text-[#7c3aed] rotate-90" />
                        </div>
                    </div>

                    {/* Academic Level */}
                    <div className="space-y-3">
                        <label className="text-xs text-slate-500 ml-1">Level</label>
                        <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-[#7c3aed] transition-colors" />
                            <select
                                value={filters.level}
                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All levels</option>
                                <option value="Bachelors">Undergraduate (Bachelors)</option>
                                <option value="Masters">Postgraduate (Masters)</option>
                                <option value="PhD">PhD / Doctorate</option>
                                <option value="Foundation">Foundation</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-hover:text-[#7c3aed] rotate-90" />
                        </div>
                    </div>

                    {/* Capital Policy */}
                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs text-slate-500">Max tuition</label>
                            <span className="text-xs font-mono font-bold text-[#7c3aed] bg-[#7c3aed]/5 px-2 py-0.5 rounded-lg border border-[#7c3aed]/10">{formatCurrency(filters.max_price)}</span>
                        </div>
                        <input
                            type="range"
                            min="5000"
                            max="100000"
                            step="1000"
                            value={filters.max_price || 50000}
                            onChange={(e) => handleFilterChange('max_price', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#7c3aed] hover:accent-indigo-600 transition-all"
                        />
                        <div className="flex justify-between px-1 text-[11px] font-bold text-slate-300">
                            <span>£5k Threshold</span>
                            <span>No limit</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 relative z-10">
                    <button
                        onClick={() => {
                            setFilters({ page: 1, search: '', country: '', level: '', max_price: 100000 });
                            setDebouncedSearch('');
                        }}
                        className="w-full py-2.5 space-x-3 bg-slate-900 border border-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm flex items-center justify-center group"
                    >
                        <RotateCcw className="w-4 h-4 text-emerald-400 transition-transform" />
                        <span>Clear filters</span>
                    </button>
                </div>
            </div>

            {/* Global Course Repository */}
            <div className="flex-1 flex flex-col min-w-0 gap-6">
                {/* Content Header */}
                <div className="flex items-end justify-between px-2">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Find Universities</h2>
                        </div>
                        <p className="text-xs text-slate-500 ml-6 opacity-60">Search and compare partner universities</p>
                    </div>
                    <div className="bg-white p-3 px-6 rounded-xl border border-slate-200 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[11px] font-bold text-slate-300">Results</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pr-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-rose-500 gap-4">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-xs font-bold">Couldn't load universities</h4>
                        <p className="text-[11px] text-slate-500">Something went wrong. Please try again.</p>
                    </div>
                ) : (data?.results || []).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center group">
                            <GraduationCap className="w-12 h-12 text-slate-100 transition-transform duration-200" strokeWidth={1} />
                        </div>
                        <div className="text-center">
                            <h4 className="text-xs text-slate-500">No results</h4>
                            <p className="text-[11px] text-slate-300 font-bold mt-2">No universities match your filters.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-10 pr-4 premium-scrollbar">
                            {data?.results.map((course) => (
                                <div
                                    key={course.id}
                                    className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-[#7c3aed]/20 transition-all duration-200 flex flex-col relative overflow-hidden"
                                >
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#7c3aed]/5 transition-colors duration-200" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 transition-all duration-200">
                                                {course.university_logo ? (
                                                    <img src={course.university_logo} alt={course.university_name} className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-200" />
                                                ) : (
                                                    <Building className="w-8 h-8 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[11px] font-bold text-[#7c3aed] bg-[#7c3aed]/5 px-3 py-1 rounded-lg border border-[#7c3aed]/10 shadow-sm">
                                                    {course.level}
                                                </span>
                                                {course.university_country && (
                                                    <span className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold group-hover:text-rose-400 transition-colors">
                                                        <MapPin className="w-3 h-3" />
                                                        {course.university_country}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-8 transition-transform duration-200">
                                            <h4 className="font-bold text-slate-900 text-2xl leading-tight mb-2 group-hover:text-[#7c3aed] transition-colors line-clamp-2" title={course.name}>
                                                {course.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                {course.university_name || 'Partner'}
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4 pt-8 border-t border-slate-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-300 font-bold">Tuition</span>
                                                <div className="flex items-center gap-1.5 text-[#7c3aed] font-bold text-xl tabular-nums">
                                                    {formatCurrency(course.tuition_fee, course.currency)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-slate-300 font-bold">Duration</span>
                                                <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px]">
                                                    <Clock className="w-3 h-3 text-emerald-400" />
                                                    {course.duration}
                                                </div>
                                            </div>
                                        </div>

                                        <button className="mt-6 w-full py-4 bg-white hover:bg-violet-600 hover:bg-violet-700 hover:text-white text-slate-900 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-slate-900 flex items-center justify-center gap-3 group/btn">
                                            <span>Universities</span>
                                            <ChevronRight className="w-3 h-3 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tactical Pagination */}
                        <div className="py-6 flex flex-col md:flex-row justify-between items-center bg-white rounded-2xl border border-white px-6 gap-6 animate-in slide-in-from-bottom-10 duration-200">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-mono text-xs shadow-sm">
                                    {data?.results.length || 0}
                                </div>
                                <p className="text-xs text-slate-500">
                                    universities found
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                                    disabled={!data?.previous}
                                    className="px-8 py-3.5 text-xs text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                                    disabled={!data?.next}
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
        </div>
    );
};

export default UniversityFinder;
