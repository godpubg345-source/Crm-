import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Users, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignBuilder = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900">New Campaign</h1>
                        <p className="text-slate-500 text-sm">Design and schedule your outreach</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-slate-200 transaction-colors flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Save Draft
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-[#AD03DE] text-white font-bold shadow-lg hover:bg-[#8a02b3] transition-colors flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Launch
                    </button>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 py-6">
                <Step number={1} title="Details" active={step >= 1} current={step === 1} />
                <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-[#AD03DE]' : 'bg-slate-200'}`} />
                <Step number={2} title="Audience" active={step >= 2} current={step === 2} />
                <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-[#AD03DE]' : 'bg-slate-200'}`} />
                <Step number={3} title="Content" active={step >= 3} current={step === 3} />
                <div className={`w-16 h-0.5 ${step >= 4 ? 'bg-[#AD03DE]' : 'bg-slate-200'}`} />
                <Step number={4} title="Review" active={step >= 4} current={step === 4} />
            </div>

            {/* Step Content */}
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 min-h-[400px]"
            >
                {step === 1 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-[#AD03DE] flex items-center justify-center text-sm">1</span>
                            Campaign Basics
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Campaign Name</label>
                                <input
                                    className="w-full text-lg p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#AD03DE]/20 focus:outline-none placeholder:text-slate-300 font-serif"
                                    placeholder="e.g., Summer UK Intake 2026"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Channel</label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none">
                                        <option>Email Blast</option>
                                        <option>SMS Broadcast</option>
                                        <option>WhatsApp (Business API)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Goal</label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none">
                                        <option>Lead Generation</option>
                                        <option>Application Follow-up</option>
                                        <option>Announcements</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                            Target Audience
                        </h2>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                            <Users className="w-12 h-12 text-slate-300 mx-auto" />
                            <p className="text-slate-500 font-medium">Select a segment or filter leads to enroll.</p>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100 font-bold text-slate-600">
                                Open Filter Modal
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">3</span>
                            Message Content
                        </h2>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                            <p className="text-slate-500 font-medium">Email/SMS Editor Placeholder</p>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">4</span>
                            Schedule & Launch
                        </h2>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                            <p className="text-slate-500 font-medium">Review summary before launching.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 rounded-xl hover:bg-slate-50 font-bold text-slate-500 disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => setStep(s => Math.min(4, s + 1))}
                        disabled={step === 4}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-300"
                    >
                        Next Step
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const Step = ({ number, title, active, current }: { number: number, title: string, active: boolean, current: boolean }) => (
    <div className={`flex items-center gap-2 ${active ? 'opacity-100' : 'opacity-40'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${current
            ? 'bg-[#AD03DE] text-white shadow-[0_0_15px_rgba(173,3,222,0.4)] scale-110'
            : active
                ? 'bg-purple-100 text-[#AD03DE]'
                : 'bg-slate-100 text-slate-400'
            }`}>
            {number}
        </div>
        <span className={`text-sm font-bold ${current ? 'text-[#AD03DE]' : 'text-slate-600'}`}>{title}</span>
    </div>
);

export default CampaignBuilder;
