import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses, type CourseFilterParams } from '../services/universities';
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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-8 animate-in fade-in duration-1000 ease-out pe-6 pb-4">

            {/* Strategic Intelligence Sidebar */}
            <div className="w-full lg:w-96 bg-white border border-slate-100/80 rounded-[3rem] p-10 flex flex-col gap-10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.04)] overflow-y-auto premium-scrollbar relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />

                <div className="relative z-10">
                    <h3 className="text-3xl font-serif font-bold text-slate-900 tracking-tight leading-none mb-2">Partner Intel</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Scholarly Protocol Filter</p>
                </div>

                <div className="space-y-8 relative z-10">
                    {/* Search Field */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Knowledge Query</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#AD03DE] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Disciplines..."
                                value={debouncedSearch}
                                onChange={(e) => setDebouncedSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 focus:border-[#AD03DE]/30 transition-all uppercase tracking-widest"
                            />
                        </div>
                    </div>

                    {/* Regional Select */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Geographic Domain</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-[#AD03DE] transition-colors" />
                            <select
                                value={filters.country}
                                onChange={(e) => handleFilterChange('country', e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 focus:ring-4 focus:ring-[#AD03DE]/10 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="">Global Coverage</option>
                                <option value="UK">United Kingdom</option>
                                <option value="USA">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">European Union</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-hover:text-[#AD03DE] rotate-90" />
                        </div>
                    </div>

                    {/* Academic Level */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Scholarly Tier</label>
                        <div className="relative group">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-[#AD03DE] transition-colors" />
                            <select
                                value={filters.level}
                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-800 focus:ring-4 focus:ring-[#AD03DE]/10 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="">All Tiers</option>
                                <option value="Bachelors">Undergraduate (Bachelors)</option>
                                <option value="Masters">Postgraduate (Masters)</option>
                                <option value="PhD">PhD / Doctorate</option>
                                <option value="Foundation">Foundation Intake</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-hover:text-[#AD03DE] rotate-90" />
                        </div>
                    </div>

                    {/* Capital Policy */}
                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital Threshold</label>
                            <span className="text-xs font-mono font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-2 py-0.5 rounded-lg border border-[#AD03DE]/10">{formatCurrency(filters.max_price)}</span>
                        </div>
                        <input
                            type="range"
                            min="5000"
                            max="100000"
                            step="1000"
                            value={filters.max_price || 50000}
                            onChange={(e) => handleFilterChange('max_price', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#AD03DE] hover:accent-indigo-600 transition-all"
                        />
                        <div className="flex justify-between px-1 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            <span>£5k Threshold</span>
                            <span>Institutional Max</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 relative z-10">
                    <button
                        onClick={() => {
                            setFilters({ page: 1, search: '', country: '', level: '', max_price: 100000 });
                            setDebouncedSearch('');
                        }}
                        className="w-full py-4 space-x-3 bg-slate-900 border border-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center group"
                    >
                        <RotateCcw className="w-4 h-4 text-emerald-400 group-hover:-rotate-45 transition-transform" />
                        <span>Purge Filtering</span>
                    </button>
                </div>
            </div>

            {/* Global Course Repository */}
            <div className="flex-1 flex flex-col min-w-0 gap-10">
                {/* Content Header */}
                <div className="flex items-end justify-between px-2">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-2 h-10 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_15px_rgba(173,3,222,0.3)]" />
                            <h2 className="text-5xl font-serif font-bold text-slate-900 tracking-tight leading-none">Academy Discovery</h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] ml-6 opacity-60">Verified scholarly domains • Comparative course intelligence</p>
                    </div>
                    <div className="bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Intelligence Synchronized</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pr-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-white rounded-[3rem] border border-slate-100 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-rose-500 gap-4">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center">
                            <X className="w-10 h-10" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em]">Intelligence Failure</h4>
                        <p className="text-[9px] text-slate-400 font-serif font-bold">Unable to retrieve scholarly package from the central node.</p>
                    </div>
                ) : (data?.results || []).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner group">
                            <GraduationCap className="w-12 h-12 text-slate-100 group-hover:rotate-12 transition-transform duration-700" strokeWidth={1} />
                        </div>
                        <div className="text-center">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Zero Results Detected</h4>
                            <p className="text-[9px] text-slate-300 font-serif font-bold mt-2">The scholarly base contains no nodes matching your tactical filtering.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 overflow-y-auto pb-10 pr-4 premium-scrollbar">
                            {data?.results.map((course) => (
                                <div
                                    key={course.id}
                                    className="group bg-white p-10 rounded-[3rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 flex flex-col relative overflow-hidden"
                                >
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/5 transition-colors duration-1000" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="w-16 h-16 bg-slate-50 group-hover:bg-white rounded-3xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:shadow-lg group-hover:-rotate-6 transition-all duration-700">
                                                {course.university_logo ? (
                                                    <img src={course.university_logo} alt={course.university_name} className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                ) : (
                                                    <Building className="w-8 h-8 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[8px] font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-3 py-1 rounded-lg border border-[#AD03DE]/10 uppercase tracking-widest shadow-sm">
                                                    {course.level}
                                                </span>
                                                {course.university_country && (
                                                    <span className="flex items-center gap-1.5 text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em] group-hover:text-rose-400 transition-colors">
                                                        <MapPin className="w-3 h-3" />
                                                        {course.university_country}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-8 group-hover:translate-x-1 transition-transform duration-500">
                                            <h4 className="font-serif font-bold text-slate-900 text-2xl leading-tight mb-2 group-hover:text-[#AD03DE] transition-colors line-clamp-2" title={course.name}>
                                                {course.name}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                {course.university_name || 'Partner Private Node'}
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4 pt-8 border-t border-slate-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Tuition Capital</span>
                                                <div className="flex items-center gap-1.5 text-[#AD03DE] font-serif font-bold text-xl tabular-nums">
                                                    {formatCurrency(course.tuition_fee, course.currency)}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Deployment Duration</span>
                                                <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px] uppercase tracking-widest">
                                                    <Clock className="w-3 h-3 text-emerald-400" />
                                                    {course.duration}
                                                </div>
                                            </div>
                                        </div>

                                        <button className="mt-10 w-full py-4 bg-white hover:bg-slate-900 hover:text-white text-slate-900 text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl transition-all border border-slate-100 hover:border-slate-900 shadow-sm active:scale-[0.98] flex items-center justify-center gap-3 group/btn">
                                            <span>Partner Intel</span>
                                            <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tactical Pagination */}
                        <div className="py-10 flex flex-col md:flex-row justify-between items-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white px-10 gap-6 animate-in slide-in-from-bottom-10 duration-1000">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-mono text-xs shadow-xl shadow-slate-200">
                                    {data?.results.length || 0}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                                    Scholarly nodes synchronized in current domain
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                                    disabled={!data?.previous}
                                    className="px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-slate-50 shadow-sm active:scale-95 flex items-center gap-3 group"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                                    disabled={!data?.next}
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
        </div>
    );
};

export default UniversityFinder;
