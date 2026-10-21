import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getSmartMatches, type SmartMatchCriteria, type SmartMatchResult } from '../../services/universities';

// ============================================================================
// AI SMART MATCHER WIDGET - Education Consultancy ERP
// ============================================================================

interface SmartMatchWidgetProps {
    student?: {
        id: string;
        first_name: string;
        last_name: string;
        cgpa?: number;
        ielts_score?: number;
        study_gap?: number;
        target_country?: string;
    };
}

const SmartMatchWidget = ({ student }: SmartMatchWidgetProps) => {
    const [criteria, setCriteria] = useState<SmartMatchCriteria>({
        cgpa: student?.cgpa || undefined,
        ielts: student?.ielts_score || undefined,
        study_gap: student?.study_gap || undefined,
        target_country: student?.target_country || '',
    });
    const [results, setResults] = useState<SmartMatchResult[]>([]);

    const matchMutation = useMutation({
        mutationFn: getSmartMatches,
        onSuccess: (data) => {
            setResults(data.results);
        },
    });

    const handleSearch = () => {
        matchMutation.mutate(criteria);
    };

    const handleCreateApplication = (result: SmartMatchResult) => {
        alert(`Application draft initialized for ${result.name}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Input Intelligence Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 relative overflow-hidden group">

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-indigo-900 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-200">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">Course match</h3>
                        <p className="text-xs text-slate-500 mt-1">Enter the student's scores to find matching courses</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* CGPA/Percentage */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">Grades</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="e.g., 3.5 or 75"
                            value={criteria.cgpa || ''}
                            onChange={(e) => setCriteria({ ...criteria, cgpa: parseFloat(e.target.value) || undefined })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {/* IELTS Score */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">IELTS</label>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="9"
                            placeholder="e.g., 6.5"
                            value={criteria.ielts || ''}
                            onChange={(e) => setCriteria({ ...criteria, ielts: parseFloat(e.target.value) || undefined })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {/* Study Gap */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">Study gap (years)</label>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            placeholder="e.g., 2"
                            value={criteria.study_gap || ''}
                            onChange={(e) => setCriteria({ ...criteria, study_gap: parseInt(e.target.value) || undefined })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {/* Target Country */}
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 ml-1">Country</label>
                        <select
                            value={criteria.target_country || ''}
                            onChange={(e) => setCriteria({ ...criteria, target_country: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 focus:border-[#7c3aed]/30 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Any country</option>
                            <option value="UK">United Kingdom</option>
                            <option value="USA">United States</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="Ireland">Ireland</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSearch}
                        disabled={matchMutation.isPending}
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-20 flex items-center gap-3 group"
                    >
                        {matchMutation.isPending ? (
                            <>
                                <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Find matches
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {matchMutation.isError && (
                <div className="p-6 text-center bg-rose-50/30 border border-rose-100 rounded-2xl">
                    <p className="text-rose-500 font-bold text-xs">Couldn't find matches</p>
                    <p className="text-rose-400 text-sm mt-1">Something went wrong. Please try again.</p>
                </div>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-base font-semibold text-slate-900 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            {results.length} Strategic Matches Identified
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {results.map((result, index) => (
                            <div
                                key={`${result.id}-${index}`}
                                className="group bg-white rounded-xl border border-border overflow-hidden hover:border-[#7c3aed]/20 transition-all duration-200 flex flex-col"
                            >
                                {/* Header with High-End Identifier */}
                                <div className="p-6 border-b border-slate-50 flex items-start gap-5 bg-slate-50/10">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden transition-transform duration-200">
                                        {result.logo ? (
                                            <img src={result.logo} alt={result.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M4 18V9l8-4 8 4v9M9 21v-6h6v6" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-base font-semibold text-slate-900 truncate">{result.name}</h5>
                                        <p className="text-xs text-slate-500 mt-1">{result.country_display}</p>
                                    </div>
                                </div>

                                {/* Intelligence Payload */}
                                <div className="p-6 flex-1 space-y-8">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-300 mb-2 font-sans">University</p>
                                        <p className="text-lg font-semibold text-slate-900 leading-snug">{result.city || 'Global Campus'}</p>
                                        {result.is_partner && (
                                            <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Partner
                                            </p>
                                        )}
                                    </div>

                                    {/* Match Score Artifact */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-slate-500">Match</span>
                                            <span className="text-xl font-semibold text-slate-900">{result.match_score}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1500 shadow-md ${result.match_score >= 90 ? 'bg-gradient-to-r from-emerald-500 to-green-300' :
                                                    result.match_score >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-300' :
                                                        result.match_score >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-300' :
                                                            'bg-gradient-to-r from-rose-500 to-pink-300'
                                                    }`}
                                                style={{ width: `${result.match_score}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Scholarship Artifact */}
                                    {result.scholarships && result.scholarships.length > 0 && (
                                        <div className="pt-4 space-y-3">
                                            <p className="text-[11px] font-bold text-slate-300">Eligible Financial Aid</p>
                                            {result.scholarships.slice(0, 2).map(s => (
                                                <div key={s.id} className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl flex items-center justify-between group/scholarship">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-emerald-700 truncate">{s.name}</p>
                                                        <p className="text-[11px] text-emerald-500 font-medium">Auto-qualified</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg border border-emerald-100 flex-shrink-0">{s.amount_display}</span>
                                                </div>
                                            ))}
                                            {result.scholarships.length > 2 && (
                                                <p className="text-[11px] text-slate-500 text-center">+{result.scholarships.length - 2} more options available</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Threshold Indicators */}
                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-bold text-slate-300">Requirements</p>
                                            <p className="text-xs text-slate-600 font-mono font-bold">
                                                GPA: {result.admission_criteria?.min_percentage || 'N/A'} <span className="mx-2 opacity-30">|</span> ELP: {result.admission_criteria?.min_ielts || 'N/A'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm bg-blue-50 text-blue-600 border-blue-100`}>
                                            {result.priority_badge || 'Standard'}
                                        </span>
                                    </div>
                                </div>

                                {/* Executive Footer */}
                                <div className="px-8 pb-8">
                                    <button
                                        onClick={() => handleCreateApplication(result)}
                                        className="w-full px-6 py-4 bg-white hover:bg-slate-900 text-slate-900 hover:text-white text-xs font-bold rounded-2xl border-2 border-slate-900 transition-all shadow-sm hover:shadow-md"
                                    >
                                        Start application
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty Intelligence State */}
            {!matchMutation.isPending && matchMutation.isSuccess && results.length === 0 && (
                <div className="text-center py-12 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-8 border border-slate-200 text-slate-200">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No matching courses</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto text-sm leading-relaxed">
                        The current neural profile did not harmonize with institutional thresholds. Calibrate parameters to explore tangential academic paths.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SmartMatchWidget;
