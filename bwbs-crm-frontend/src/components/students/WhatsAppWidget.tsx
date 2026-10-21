import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import api from '../../services/api';

// ============================================================================
// WHATSAPP WIDGET - Education Consultancy ERP
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
                className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-sm group"
            >
                <div className="p-1.5 bg-white/20 rounded-lg transition-transform">
                    <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Send WhatsApp</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 ease-out">
                {/* Brand Header */}
                <div className="bg-[#075E54] p-6 text-white relative overflow-hidden">

                    <button
                        onClick={() => setOpen(false)}
                        className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 shadow-sm">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">{studentName}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-xs font-bold opacity-70">{phoneNumber || 'No phone number'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interface Content */}
                <div className="p-6 space-y-8 bg-gradient-to-b from-white to-slate-50/50">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs text-slate-500 block">Message</label>
                            <span className="text-xs font-bold text-slate-300">{message.length}/1000</span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows={5}
                            className="w-full bg-white border border-slate-200 rounded-xl p-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/40 outline-none transition-all resize-none placeholder:font-bold placeholder:text-slate-200"
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSend}
                            disabled={sending || !message}
                            className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-bold text-[11px] shadow-sm hover:bg-[#1ebd5e] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group/btn"
                        >
                            {sending ? 'Engaging Link...' : (
                                <>
                                    Send via WhatsApp
                                    <Send className="w-4 h-4 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="pt-4 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-6">
                                <div className="h-px w-12 bg-slate-100" />
                                <p className="text-[11px] font-bold text-slate-300">Note</p>
                                <div className="h-px w-12 bg-slate-100" />
                            </div>
                            <p className="text-[11px] font-bold text-slate-400/60 max-w-[280px] text-center leading-relaxed">
                                This message will be saved to the student's history.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
