import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLeadInteraction, type Lead, type WhatsAppTemplate } from '../../services/leads';
import { X, Send, CheckCircle2, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';

interface WhatsAppMagicDispatcherProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads: Lead[];
    template: WhatsAppTemplate;
}

const WhatsAppMagicDispatcher = ({ isOpen, onClose, selectedLeads, template }: WhatsAppMagicDispatcherProps) => {
    const queryClient = useQueryClient();
    const [sentIds, setSentIds] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    const interactionMutation = useMutation({
        mutationFn: createLeadInteraction,
        onSuccess: (_, variables) => {
            setSentIds(prev => [...prev, variables.lead]);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-interactions', variables.lead] });

            // Auto-advance if not the last one
            if (currentStep < selectedLeads.length - 1) {
                // We don't auto-advance instantly to give visual feedback
            }
        },
    });

    const handleSendNext = (lead: Lead) => {
        // 1. Log the interaction
        interactionMutation.mutate({
            lead: lead.id,
            type: 'WHATSAPP',
            content: `Sent WhatsApp Template (Bulk): ${template.title}\n\nContent: ${template.formatted_message}`,
        });

        // 2. Open WhatsApp
        const encodedMessage = encodeURIComponent(template.formatted_message);
        const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    };

    if (!isOpen) return null;

    const progress = (sentIds.length / selectedLeads.length) * 100;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-32 -mt-32" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 font-serif tracking-tight">WhatsApp <span className="text-emerald-600">Magic</span> Dispatcher</h2>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                                <span>Template: {template.title}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>Queue: {selectedLeads.length} Leads</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all hover:rotate-90">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 relative">
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out shadow-lg"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>{sentIds.length} Sent</span>
                            <span>{Math.round(progress)}% Complete</span>
                            <span>{selectedLeads.length - sentIds.length} Remaining</span>
                        </div>
                    </div>
                </div>

                {/* Dispatcher List */}
                <div className="flex-1 overflow-y-auto p-8 premium-scrollbar space-y-4 bg-slate-50/30">
                    {selectedLeads.map((lead, index) => {
                        const isSent = sentIds.includes(lead.id);
                        const isCurrent = index === currentStep;

                        return (
                            <div
                                key={lead.id}
                                className={`group p-6 rounded-3xl border-2 transition-all duration-500 ease-out flex items-center justify-between ${isSent
                                        ? 'bg-emerald-50/50 border-emerald-100 opacity-60'
                                        : isCurrent
                                            ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]'
                                            : 'bg-white border-slate-100 opacity-40 grayscale'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isSent ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {isSent ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            {lead.first_name} {lead.last_name}
                                            {isSent && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Dispatched</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium">{lead.phone}</p>
                                    </div>
                                </div>

                                {!isSent && (
                                    <button
                                        onClick={() => {
                                            handleSendNext(lead);
                                            if (currentStep < selectedLeads.length - 1) {
                                                setCurrentStep(prev => prev + 1);
                                            }
                                        }}
                                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isCurrent
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                        disabled={!isCurrent}
                                    >
                                        <Send className="w-4 h-4" />
                                        Launch Message
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </button>
                                )}

                                {isSent && (
                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4 animate-pulse" />
                                        Success
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center">
                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-[250px]">
                        Tip: Open WhatsApp in the background to speed up the process.
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                        >
                            {progress === 100 ? 'Finish Campaign' : 'Pause & Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppMagicDispatcher;
