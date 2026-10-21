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
                className="absolute inset-0 bg-slate-900/60"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-sm overflow-hidden"
            >
                {/* Visual Header */}
                <div className="h-32 bg-slate-900 p-6 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#7c3aed]/20 to-indigo-600/20" />

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                            <Sparkles className="w-6 h-6 text-[#7c3aed]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-white tracking-tight">Smart Match</h2>
                            <p className="text-[11px] font-semibold text-slate-400">Find courses the student qualifies for</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="relative z-10 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form Area */}
                <div className="p-6 space-y-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#7c3aed]" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                            Enter the student's details to see matching courses from partner universities.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* CGPA */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <GraduationCap className="w-3.5 h-3.5" />
                                GPA/Percentage
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 75"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.cgpa}
                                onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                            />
                        </div>

                        {/* IELTS */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <Languages className="w-3.5 h-3.5" />
                                IELTS/Equivalent
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                placeholder="e.g. 6.5"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.ielts}
                                onChange={(e) => setProfile({ ...profile, ielts: e.target.value })}
                            />
                        </div>

                        {/* Gap Years */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <Clock className="w-3.5 h-3.5" />
                                Study Gap (Years)
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.gap_years}
                                onChange={(e) => setProfile({ ...profile, gap_years: e.target.value })}
                            >
                                <option value="0">No gap</option>
                                <option value="1">1 YEAR</option>
                                <option value="2">2 YEARS</option>
                                <option value="3">3 YEARS</option>
                                <option value="5">5+ YEARS</option>
                            </select>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <Wallet className="w-3.5 h-3.5" />
                                Tuition Budget
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.budget}
                                onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                            >
                                <option value="10k">Under £10k</option>
                                <option value="15k">£10K - £15K</option>
                                <option value="20k">£15K - £20K</option>
                                <option value="unlimited">No limit</option>
                            </select>
                        </div>

                        {/* Target Country */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <Globe className="w-3.5 h-3.5" />
                                Target Country
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.target_country}
                                onChange={(e) => setProfile({ ...profile, target_country: e.target.value })}
                            >
                                <option value="UK">United Kingdom</option>
                                <option value="USA">United States</option>
                                <option value="CANADA">Canada</option>
                                <option value="AUSTRALIA">Australia</option>
                                <option value="ANY">Any country</option>
                            </select>
                        </div>

                        {/* Target Intake */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 px-2">
                                <Search className="w-3.5 h-3.5" />
                                Preferred Intake
                            </label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all"
                                value={profile.target_intake}
                                onChange={(e) => setProfile({ ...profile, target_intake: e.target.value })}
                            >
                                <option value="September">September</option>
                                <option value="January">January</option>
                                <option value="May">May</option>
                                <option value="Any">Any intake</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={() => onMatch(profile)}
                            className="w-full py-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 group hover:bg-black shadow-sm transition-all"
                        >
                            <span className="text-xs font-semibold">Find matches</span>
                            <ArrowRight className="w-5 h-5 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
