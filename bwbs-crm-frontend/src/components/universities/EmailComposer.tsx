import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, Mail, Send, FileText,
    CheckCircle, Eye, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'onboarding' | 'intake' | 'document' | 'follow_up' | 'custom';
}

interface EmailComposerProps {
    isOpen: boolean;
    onClose: () => void;
    universityName: string;
    universityEmail?: string;
    contactName?: string;
    onSend: (email: { to: string; subject: string; body: string }) => Promise<void>;
}

// Pre-built templates with placeholder tokens
const emailTemplates: EmailTemplate[] = [
    {
        id: 'onboard_welcome',
        name: 'Welcome to Partnership',
        subject: 'Welcome to BWBS Partnership Network - {{university_name}}',
        body: `Dear { { contact_name } },

We are delighted to officially welcome { { university_name } } to the BWBS Education Partnership Network!

As your dedicated partner, we are committed to providing high - quality student referrals and supporting your international recruitment goals.

** Next Steps:**
    1. Complete your partner profile in our portal
2. Share course catalogs and admission requirements
3. Schedule a kickoff call with your account manager

We look forward to a successful and mutually beneficial partnership.

Best regards,
    BWBS Education Team`,
        category: 'onboarding'
    },
    {
        id: 'intake_reminder',
        name: 'Intake Deadline Reminder',
        subject: 'Upcoming Intake Deadline - {{intake_month}} {{intake_year}}',
        body: `Dear { { contact_name } },

This is a friendly reminder that the application deadline for the {{ intake_month }} { { intake_year } } intake is approaching.

** Current Pipeline:**
    - Applications in progress: [X]
        - Documents pending: [Y]
            - Ready for submission: [Z]

Please let us know if you have any updates on scholarship availability or last - minute seat availability for this intake.

Best regards,
        BWBS Education Team`,
        category: 'intake'
    },
    {
        id: 'document_request',
        name: 'Document Request',
        subject: 'Partnership Document Request - {{university_name}}',
        body: `Dear { { contact_name } },

We are updating our partner records and require the following documents from { { university_name } }:

☐ Updated course brochure for {{ current_year }}
☐ Commission structure document
☐ Updated admission requirements
☐ Partnership agreement renewal(if applicable)

Please share these at your earliest convenience.You can upload directly to your partner portal or reply to this email with attachments.

Thank you for your continued partnership.

Best regards,
    BWBS Education Team`,
        category: 'document'
    },
    {
        id: 'follow_up',
        name: 'Application Follow-up',
        subject: 'Application Status Follow-up - {{student_count}} Pending',
        body: `Dear { { contact_name } },

I hope this email finds you well.

We have { { student_count } } student applications pending review with {{ university_name }}. Could you kindly provide an update on the following:

** Pending Applications:**
    {{ pending_list }}

Timely feedback would help us guide students through their decision - making process.

Thank you for your support.

Best regards,
        BWBS Education Team`,
        category: 'follow_up'
    },
    {
        id: 'custom',
        name: 'Custom Message',
        subject: '',
        body: '',
        category: 'custom'
    }
];

const categoryColors: Record<string, string> = {
    onboarding: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    intake: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    document: 'bg-amber-50 text-amber-600 border-amber-100',
    follow_up: 'bg-pink-50 text-pink-600 border-pink-100',
    custom: 'bg-slate-50 text-slate-600 border-slate-100'
};

/**
 * Email Composer Modal with Template Support
 */
export const EmailComposer: React.FC<EmailComposerProps> = ({
    isOpen, onClose, universityName, universityEmail, contactName, onSend
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [recipientEmail, setRecipientEmail] = useState(universityEmail || '');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const replacePlaceholders = (text: string) => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

        return text
            .replace(/{{university_name}}/g, universityName)
            .replace(/{{contact_name}}/g, contactName || 'Partner')
            .replace(/{{current_year}}/g, String(currentYear))
            .replace(/{{intake_month}}/g, currentMonth)
            .replace(/{{intake_year}}/g, String(currentYear))
            .replace(/{{student_count}}/g, '5')  // Placeholder
            .replace(/{{pending_list}}/g, '• Student 1\n• Student 2\n• Student 3');
    };

    const selectTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setSubject(replacePlaceholders(template.subject));
        setBody(replacePlaceholders(template.body));
    };

    const handleSend = async () => {
        if (!recipientEmail || !subject || !body) return;

        setIsSending(true);
        try {
            await onSend({ to: recipientEmail, subject, body });
            setSent(true);
            setTimeout(() => {
                onClose();
                setSent(false);
                setSelectedTemplate(null);
                setSubject('');
                setBody('');
            }, 2000);
        } catch (error) {
            console.error('Email send failed:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex"
            >
                {/* Template Sidebar */}
                <div className="w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-[#AD03DE]" />
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                            Templates
                        </h3>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {emailTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => selectTemplate(template)}
                                className={clsx(
                                    "w-full p-4 rounded-2xl text-left transition-all",
                                    selectedTemplate?.id === template.id
                                        ? "bg-white shadow-lg ring-2 ring-[#AD03DE]/20"
                                        : "hover:bg-white hover:shadow-sm"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={clsx(
                                        "text-[8px] font-black uppercase px-2 py-1 rounded-lg border",
                                        categoryColors[template.category]
                                    )}>
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-[11px] font-black text-slate-900">
                                    {template.name}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Composer Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#AD03DE]/10 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-[#AD03DE]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-black text-slate-900 uppercase tracking-tight">
                                    Compose Email
                                </h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {universityName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPreview(!isPreview)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all",
                                    isPreview
                                        ? "bg-[#AD03DE] text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                <Eye className="w-3 h-3" />
                                Preview
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Email Form */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </motion.div>
                                <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">
                                    Email Sent!
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Your message has been delivered successfully.
                                </p>
                            </div>
                        ) : isPreview ? (
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</p>
                                        <p className="text-sm font-bold text-slate-900">{recipientEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                                        <p className="text-sm font-bold text-slate-900">{subject}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-6 border border-slate-100 prose prose-sm max-w-none whitespace-pre-wrap">
                                    {body}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Recipient Email
                                    </label>
                                    <input
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        placeholder="partner@university.edu"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Subject Line
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Enter email subject..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                        Message Body
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Compose your message..."
                                        rows={12}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/20 resize-none"
                                    />
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-[#AD03DE]" />
                                    <p className="text-[9px] font-bold text-slate-500">
                                        <strong>Pro Tip:</strong> Use placeholders like {'{{university_name}}'}, {'{{contact_name}}'} for personalization
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {!sent && (
                        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSend}
                                disabled={!recipientEmail || !subject || !body || isSending}
                                className="px-8 py-3 bg-[#AD03DE] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSending ? 'Sending...' : 'Send Email'}
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
