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
        <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-xl bg-white border-l border-slate-100 shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.15)] animate-in slide-in-from-right duration-700 flex flex-col">
            {/* Header */}
            <div className="p-10 border-b border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 rounded-full hover:bg-slate-50 text-slate-400 transition-all active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-inner">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tighter">Follow The Sun</h2>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.4em] opacity-80">Smart Handoff Intelligence</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-serif font-bold leading-relaxed max-w-sm">
                        Branch <span className="text-slate-900 font-black">{branch.code}</span> is currently offline.
                        HQ Intelligence suggests migrating active payloads to online nodes.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 py-20 opacity-20">
                        <Loader2 className="w-10 h-10 animate-spin" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Parsing Regional Payloads</p>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 py-20 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-4">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-serif font-black text-slate-900 tracking-tight">Zero Critical Loads</h3>
                        <p className="text-sm text-slate-400 font-serif font-bold max-w-xs">No active leads require immediate migration from this node.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2 mb-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {suggestions.length} Suggested Migrations
                            </span>
                        </div>

                        {suggestions.map((suggestion: any) => (
                            <div
                                key={suggestion.lead_id}
                                className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-100 transition-all duration-700 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ArrowRightLeft className="w-20 h-20 rotate-12" />
                                </div>

                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Lead ID: {suggestion.lead_id.split('-')[0]}</p>
                                        <h4 className="text-xl font-serif font-black text-slate-900 tracking-tight">Active Operation</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#AD03DE]">
                                            <ArrowRightLeft className="w-3 h-3" />
                                            Target Node: {suggestion.suggested_branch}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => mutation.mutate(suggestion.lead_id)}
                                        disabled={mutation.isPending}
                                        className="h-14 px-8 bg-slate-900 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 group/btn"
                                    >
                                        {mutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Execute Handoff
                                                <Zap className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-start gap-3">
                                    <ShieldAlert className="w-4 h-4 text-slate-300 mt-0.5" />
                                    <p className="text-xs text-slate-400 font-serif font-bold italic leading-relaxed">
                                        "{suggestion.reason}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-10 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    Global synchronization protocols ensure <br />
                    zero downtime operations across the network.
                </p>
            </div>
        </div>
    );
};

export default HandoffSuggestionsPanel;
