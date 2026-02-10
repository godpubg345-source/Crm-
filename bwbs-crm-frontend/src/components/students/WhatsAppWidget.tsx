import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import api from '../../services/api';

// ============================================================================
// WHATSAPP WIDGET - BWBS Education CRM
// ============================================================================

interface WhatsAppWidgetProps {
    studentId: string;
    studentName: string;
    phoneNumber: string;
    onSuccess?: () => void;
}

export const WhatsAppWidget = ({ studentId, studentName, phoneNumber, onSuccess }: WhatsAppWidgetProps) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSend = async () => {
        if (!message) return;
        setSending(true);
        try {
            await api.post('/communications/send_whatsapp/', {
                student: studentId,
                message: message
            });
            setMessage('');
            setOpen(false);
            onSuccess?.();

            // Generate WhatsApp URL and open in new tab
            const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to initiate WhatsApp transmission:', error);
        } finally {
            setSending(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95 group"
            >
                <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Initiate WhatsApp</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-700 ease-out">
                {/* Brand Header */}
                <div className="bg-[#075E54] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-xl">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold tracking-tight">{studentName}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.3em]">{phoneNumber || 'Protocol Secure'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interface Content */}
                <div className="p-10 space-y-8 bg-gradient-to-b from-white to-slate-50/50">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Message Payload</label>
                            <span className="text-[10px] font-bold text-slate-300">{message.length}/1000</span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Awaiting strategic input for student engagement..."
                            rows={5}
                            className="w-full bg-white border border-slate-200 rounded-[2rem] p-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/40 outline-none transition-all resize-none shadow-sm placeholder:font-bold placeholder:text-slate-200"
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSend}
                            disabled={sending || !message}
                            className="w-full py-5 bg-[#25D366] text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-emerald-200/50 hover:bg-[#1ebd5e] hover:shadow-emerald-300/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group/btn"
                        >
                            {sending ? 'Engaging Link...' : (
                                <>
                                    Transmit via WhatsApp
                                    <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="pt-4 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-6">
                                <div className="h-px w-12 bg-slate-100" />
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Compliance Check</p>
                                <div className="h-px w-12 bg-slate-100" />
                            </div>
                            <p className="text-[8px] font-bold text-slate-400/60 uppercase tracking-wider max-w-[280px] text-center leading-relaxed">
                                This transmission will be archived in the student's central intelligence log for audit purposes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
