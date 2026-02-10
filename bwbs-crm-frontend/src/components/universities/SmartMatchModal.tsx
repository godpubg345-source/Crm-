import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X, Search, Sparkles, GraduationCap,
    Languages, Clock, Wallet, Globe, ArrowRight
} from 'lucide-react';

interface SmartMatchProps {
    isOpen: boolean;
    onClose: () => void;
    onMatch: (profile: any) => void;
}

export const SmartMatchModal: React.FC<SmartMatchProps> = ({ isOpen, onClose, onMatch }) => {
    const [profile, setProfile] = useState({
        cgpa: '',
        ielts: '',
        gap_years: '0',
        budget: '20k',
        target_country: 'UK',
        target_intake: 'September'
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
                className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Visual Header */}
                <div className="h-32 bg-slate-900 p-8 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#AD03DE]/20 to-indigo-600/20" />
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#AD03DE]/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Sparkles className="w-6 h-6 text-[#AD03DE]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">Smart Match</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI-Driven Eligibility Prediction</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form Area */}
                <div className="p-10 space-y-8">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#AD03DE]/10 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#AD03DE]" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                            Input student parameters below to generate personalized matches from our global partner network.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* CGPA */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <GraduationCap className="w-3.5 h-3.5" />
                                GPA/Percentage
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 75"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.cgpa}
                                onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                            />
                        </div>

                        {/* IELTS */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <Languages className="w-3.5 h-3.5" />
                                IELTS/Equivalent
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                placeholder="e.g. 6.5"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.ielts}
                                onChange={(e) => setProfile({ ...profile, ielts: e.target.value })}
                            />
                        </div>

                        {/* Gap Years */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <Clock className="w-3.5 h-3.5" />
                                Study Gap (Years)
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.gap_years}
                                onChange={(e) => setProfile({ ...profile, gap_years: e.target.value })}
                            >
                                <option value="0">NO GAP (FRESH)</option>
                                <option value="1">1 YEAR</option>
                                <option value="2">2 YEARS</option>
                                <option value="3">3 YEARS</option>
                                <option value="5">5+ YEARS</option>
                            </select>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <Wallet className="w-3.5 h-3.5" />
                                Tuition Budget
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.budget}
                                onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                            >
                                <option value="10k">UNDER £10K</option>
                                <option value="15k">£10K - £15K</option>
                                <option value="20k">£15K - £20K</option>
                                <option value="unlimited">NO LIMIT</option>
                            </select>
                        </div>

                        {/* Target Country */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <Globe className="w-3.5 h-3.5" />
                                Target Country
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.target_country}
                                onChange={(e) => setProfile({ ...profile, target_country: e.target.value })}
                            >
                                <option value="UK">UNITED KINGDOM</option>
                                <option value="USA">UNITED STATES</option>
                                <option value="CANADA">CANADA</option>
                                <option value="AUSTRALIA">AUSTRALIA</option>
                                <option value="ANY">ANY COUNTRY</option>
                            </select>
                        </div>

                        {/* Target Intake */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                <Search className="w-3.5 h-3.5" />
                                Preferred Intake
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all"
                                value={profile.target_intake}
                                onChange={(e) => setProfile({ ...profile, target_intake: e.target.value })}
                            >
                                <option value="September">SEPTEMBER</option>
                                <option value="January">JANUARY</option>
                                <option value="May">MAY</option>
                                <option value="Any">ANY INTAKE</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={() => onMatch(profile)}
                            className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-3 group hover:bg-black shadow-xl shadow-slate-200 transition-all"
                        >
                            <span className="text-xs font-black uppercase tracking-widest">Execute AI Matching</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
