import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhatsAppTemplates, createLeadInteraction } from '../../services/leads';
import type { WhatsAppTemplate, Lead } from '../../services/leads';
import { MessageCircle, Send, X, Copy, Check, Sparkles } from 'lucide-react';

interface WhatsAppAutomationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
}

const WhatsAppAutomationDrawer = ({ isOpen, onClose, lead }: WhatsAppAutomationDrawerProps) => {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
    const [copied, setCopied] = useState(false);

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['whatsapp-templates', lead.id],
        queryFn: () => getWhatsAppTemplates(lead.id),
        enabled: isOpen,
    });

    const interactionMutation = useMutation({
        mutationFn: createLeadInteraction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['lead-interactions', lead.id] });
        },
    });

    const handleSend = () => {
        if (!selectedTemplate) return;

        // 1. Log the interaction
        interactionMutation.mutate({
            lead: lead.id,
            type: 'WHATSAPP',
            content: `Sent WhatsApp Template: ${selectedTemplate.title}\n\nContent: ${selectedTemplate.formatted_message}`,
        });

        // 2. Open WhatsApp
        const encodedMessage = encodeURIComponent(selectedTemplate.formatted_message);
        const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');

        onClose();
    };

    const handleCopy = () => {
        if (!selectedTemplate) return;
        navigator.clipboard.writeText(selectedTemplate.formatted_message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 font-serif">WhatsApp <span className="text-[#AD03DE]">Magic</span></h2>
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Automated Follow-up for {lead.first_name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 premium-scrollbar space-y-8">
                    {/* Templates Grid */}
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Template</h3>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-slate-400 text-sm">No templates configured yet.</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Manage templates in settings</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {Array.isArray(templates) && templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`text-left p-4 rounded-2xl border-2 transition-all group ${selectedTemplate?.id === template.id
                                            ? 'border-[#AD03DE] bg-purple-50/50 shadow-md shadow-[#AD03DE]/10'
                                            : 'border-slate-100 hover:border-[#AD03DE]/30 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTemplate?.id === template.id ? 'text-[#AD03DE]' : 'text-slate-400'
                                                }`}>
                                                {template.category_display}
                                            </span>
                                            {selectedTemplate?.id === template.id && (
                                                <Sparkles className="w-3 h-3 text-[#AD03DE] animate-pulse" />
                                            )}
                                        </div>
                                        <p className="font-bold text-slate-900 group-hover:text-[#AD03DE] transition-colors">{template.title}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Preview Area */}
                    {selectedTemplate && (
                        <section className="animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Message Preview</h3>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#AD03DE] hover:bg-purple-50 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <><Check className="w-3 h-3" /> Copied</>
                                    ) : (
                                        <><Copy className="w-3 h-3" /> Copy Text</>
                                    )}
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-br from-[#AD03DE] to-purple-800 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-all duration-500" />
                                <div className="relative p-6 bg-slate-900 rounded-[2rem] text-slate-100 text-sm font-bold leading-relaxed shadow-xl whitespace-pre-wrap font-serif">
                                    <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-slate-800" />
                                    {selectedTemplate.formatted_message}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                    <button
                        disabled={!selectedTemplate || interactionMutation.isPending}
                        onClick={handleSend}
                        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.1em] transition-all active:scale-[0.98] ${selectedTemplate
                            ? 'bg-[#AD03DE] text-white shadow-xl shadow-[#AD03DE]/30 hover:bg-purple-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {interactionMutation.isPending ? (
                            'Logging...'
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Open WhatsApp & Log Interaction
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppAutomationDrawer;
