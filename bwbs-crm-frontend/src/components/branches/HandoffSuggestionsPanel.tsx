import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHandoffSuggestions, executeHandoff, type Branch } from '../../services/branches';
import { X, ArrowRightLeft, Zap, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';

interface HandoffSuggestionsPanelProps {
    branch: Branch;
    onClose: () => void;
}

const HandoffSuggestionsPanel = ({ branch, onClose }: HandoffSuggestionsPanelProps) => {
    const queryClient = useQueryClient();

    const { data: suggestions = [], isLoading } = useQuery({
        queryKey: ['handoff-suggestions', branch.id],
        queryFn: () => getHandoffSuggestions(branch.id),
        enabled: !!branch.id
    });

    const mutation = useMutation({
        mutationFn: (leadId: string) => executeHandoff(branch.id, leadId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handoff-suggestions', branch.id] });
            queryClient.invalidateQueries({ queryKey: ['branch-analytics', branch.id] });
        }
    });

    return (
        <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-xl bg-white border-l border-slate-100 animate-in slide-in-from-right duration-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 relative overflow-hidden">

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-50 text-slate-400 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">After hours</h2>
                            <p className="text-xs font-bold text-amber-600 opacity-80">Handoff suggestions</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-sm">
                        Branch <span className="text-slate-900 font-semibold">{branch.code}</span> is closed right now. Consider moving its urgent leads to an open branch.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 py-12 opacity-20">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="text-xs font-bold">Checking branches...</p>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 py-12 text-center">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Nothing to move</h3>
                        <p className="text-sm text-slate-400 font-bold max-w-xs">No urgent leads need to be moved.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2 mb-6">
                            <span className="text-xs font-semibold text-slate-400">
                                {suggestions.length} Suggested Migrations
                            </span>
                        </div>

                        {suggestions.map((suggestion: any) => (
                            <div
                                key={suggestion.lead_id}
                                className="group p-6 rounded-xl border border-slate-200 bg-white hover:border-amber-200 transition-all duration-200 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ArrowRightLeft className="w-20 h-20 rotate-12" />
                                </div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-300 mb-1">Lead ID: {suggestion.lead_id.split('-')[0]}</p>
                                        <h4 className="text-xl font-semibold text-slate-900 tracking-tight">Open</h4>
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#7c3aed]">
                                            <ArrowRightLeft className="w-3 h-3" />
                                            To branch: {suggestion.suggested_branch}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => mutation.mutate(suggestion.lead_id)}
                                        disabled={mutation.isPending}
                                        className="h-14 px-8 bg-slate-900 hover:bg-amber-500 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-3 group/btn"
                                    >
                                        {mutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Move leads
                                                <Zap className="w-4 h-4 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-start gap-3">
                                    <ShieldAlert className="w-4 h-4 text-slate-300 mt-0.5" />
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        "{suggestion.reason}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 leading-relaxed">
                    Leads keep moving <br />
                    even when a branch is closed.
                </p>
            </div>
        </div>
    );
};

export default HandoffSuggestionsPanel;
