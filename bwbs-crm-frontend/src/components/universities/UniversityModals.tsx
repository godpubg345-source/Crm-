import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, ChevronRight, ChevronLeft, Building,
    Globe, Shield, Users, Mail, Phone, FileText,
    TrendingUp, Calendar, Zap, Download, File, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { getUniversityContacts, getUniversityDocuments } from '../../services/universities';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    university?: any;
}

/**
 * Multi-step Institutional Onboarding Wizard
 */
export const OnboardingWizard: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px]"
            >
                {/* Status Sidebar */}
                <div className="w-full md:w-80 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#AD03DE]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#AD03DE] to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-black text-white uppercase tracking-tighter">Onboard</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Registry</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {[
                                { n: 1, label: 'Institution Profile', icon: Building },
                                { n: 2, label: 'Partnership Terms', icon: Shield },
                                { n: 3, label: 'Command Contacts', icon: Users },
                                { n: 4, label: 'Admission Logic', icon: Zap }
                            ].map((s) => (
                                <div key={s.n} className="flex items-center gap-4 group">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                                        step === s.n ? "bg-[#AD03DE] border-[#AD03DE] text-white shadow-lg shadow-purple-500/40 scale-110" :
                                            step > s.n ? "bg-emerald-500 border-emerald-500 text-white" :
                                                "bg-transparent border-slate-700 text-slate-500"
                                    )}>
                                        {step > s.n ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className={clsx(
                                            "text-[10px] font-black uppercase tracking-widest leading-none",
                                            step === s.n ? "text-white" : "text-slate-500"
                                        )}>{s.label}</p>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Step 0{s.n}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-slate-800">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Registry Integrity</p>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#AD03DE]"
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-12 flex flex-col h-full relative">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter uppercase">Identity</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic Institutional Parameters</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution Name</label>
                                                <input type="text" placeholder="e.g. UNIVERSITY OF LONDON" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Domain</label>
                                                <input type="text" placeholder="WWW.UNIVERSITY.AC.UK" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Hub (City)</label>
                                                <input type="text" placeholder="LONDON" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sovereign Domain (Country)</label>
                                                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all">
                                                    <option>UNITED KINGDOM</option>
                                                    <option>UNITED STATES</option>
                                                    <option>CANADA</option>
                                                    <option>AUSTRALIA</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-[#AD03DE]/20 transition-all cursor-pointer">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Globe className="w-5 h-5 text-slate-400 group-hover:text-[#AD03DE]" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deploy Logo Identifier</p>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter uppercase">Contract</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partnership Vector & Commission Intelligence</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Commission (%)</label>
                                                <input type="number" placeholder="10.0" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contract Start</label>
                                                <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="md:col-span-2 p-8 bg-purple-50/30 rounded-3xl border border-purple-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="w-5 h-5 text-[#AD03DE]" />
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Strategic Exclusivity</h4>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Does this institution grant exclusive representation rights within targeted territories?</p>
                                                <div className="flex gap-4">
                                                    <button className="flex-1 py-4 bg-white border border-[#AD03DE] text-[#AD03DE] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Exclusive Node</button>
                                                    <button className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Standard Node</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter uppercase">Contacts</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Decision Makers & Liaisons</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 group">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                    <Users className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <input type="text" placeholder="NAME" className="bg-transparent text-[10px] font-black p-2 border-b border-slate-200 focus:border-[#AD03DE] outline-none" />
                                                    <input type="text" placeholder="ROLE" className="bg-transparent text-[10px] font-black p-2 border-b border-slate-200 focus:border-[#AD03DE] outline-none" />
                                                </div>
                                            </div>
                                            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-[#AD03DE]/30 hover:text-[#AD03DE] transition-all flex items-center justify-center gap-2">
                                                <Zap className="w-3.5 h-3.5" />
                                                Append Contact Node
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter uppercase">Admission</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criteria Matrices & Policy Constraints</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. academic Score (%)</label>
                                                <input type="number" placeholder="60" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. IELTS Overall</label>
                                                <input type="number" placeholder="6.0" step="0.5" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accepted Study Gap (Years)</label>
                                                <input type="number" placeholder="2" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">accept territories</label>
                                                <input type="text" placeholder="GLOBAL" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls */}
                    <div className="pt-10 flex items-center justify-between border-t border-slate-100 mt-auto">
                        <button
                            onClick={prevStep}
                            disabled={step === 1}
                            className="px-8 py-4 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-0 flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Pre-Vector
                        </button>

                        {step < totalSteps ? (
                            <button
                                onClick={nextStep}
                                className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all flex items-center gap-3"
                            >
                                Next Alignment
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log('Finalizing Onboarding - Mock Submission');
                                    onClose();
                                }}
                                className="px-10 py-5 bg-[#AD03DE] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all flex items-center gap-3"
                            >
                                Finalize Deployment
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/**
 * University Deep-Dive Dossier (Slide-over)
 */
export const UniversityDossier: React.FC<ModalProps> = ({ isOpen, onClose, university }) => {
    const [activeTab, setActiveTab] = useState('Overview');

    const { data: contacts, isLoading: contactsLoading } = useQuery({
        queryKey: ['universityContacts', university?.id],
        queryFn: () => getUniversityContacts(university.id),
        enabled: !!university?.id && activeTab === 'Contacts'
    });

    const { data: documents, isLoading: docsLoading } = useQuery({
        queryKey: ['universityDocuments', university?.id],
        queryFn: () => getUniversityDocuments(university.id),
        enabled: !!university?.id && activeTab === 'Vault'
    });

    if (!isOpen || !university) return null;

    return (
        <div className="fixed inset-0 z-[110] flex justify-end overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-slate-50 shadow-2xl overflow-hidden flex flex-col h-full border-l border-slate-100"
            >
                {/* Header Section */}
                <div className="relative h-64 bg-slate-900 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#AD03DE]/30 to-indigo-900/40" />
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-10 flex items-end justify-between gap-6 translate-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-center">
                                {university.logo ? (
                                    <img src={university.logo} alt={university.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building className="w-10 h-10 text-slate-200" />
                                )}
                            </div>
                            <div className="mb-8">
                                <h2 className="text-4xl font-serif font-black text-white tracking-tighter uppercase leading-none">{university.name}</h2>
                                <p className="text-[10px] font-black text-[#AD03DE] uppercase tracking-[0.4em] mt-3">Strategic Intelligence Folder</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 mt-6 space-y-10">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-6 bg-white rounded-3xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Growth Vector</p>
                            <p className="text-xl font-serif font-black text-slate-900">{university.course_count || 0} Courses</p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Fee Tier</p>
                            <p className="text-xl font-serif font-black text-slate-900">£12k-18k</p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Commission</p>
                            <p className="text-xl font-serif font-black text-[#AD03DE]">{university.commission_rate || '12.5'}%</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex p-1 bg-slate-200/50 rounded-2xl border border-slate-200">
                        {['Overview', 'Courses', 'Vault', 'Contacts'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Switching */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'Overview' && (
                            <motion.div
                                key="Overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Policy Constraints</h4>
                                    <button className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest hover:underline">Edit Protocol</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Min. Percentage', value: university.admission_criteria?.min_percentage ? university.admission_criteria.min_percentage + '%' : '60%', icon: Globe },
                                        { label: 'Language Threshold', value: university.admission_criteria?.min_ielts || '6.0', icon: FileText },
                                        { label: 'Career Gap Limit', value: university.admission_criteria?.gap_limit ? university.admission_criteria.gap_limit + ' Years' : '2 Years', icon: TrendingUp },
                                        { label: 'Next Intake Vector', value: 'SEP 2025', icon: Calendar }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 group hover:border-[#AD03DE]/30 transition-all">
                                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#AD03DE] transition-colors">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                                                <p className="text-xs font-black text-slate-900 uppercase">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Contacts' && (
                            <motion.div
                                key="Contacts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Contact Nodes</h4>
                                    <button className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest hover:underline">Add New</button>
                                </div>

                                {contactsLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                                ) : contacts && contacts.length > 0 ? (
                                    <div className="space-y-3">
                                        {contacts.map((contact: any) => (
                                            <div key={contact.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-black text-[#AD03DE] text-xs">
                                                        {contact.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase">{contact.name}</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{contact.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href={`mailto:${contact.email}`} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Mail className="w-4 h-4" /></a>
                                                    <a href={`tel:${contact.phone}`} className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all"><Phone className="w-4 h-4" /></a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-3xl">
                                        <p className="text-xs text-slate-400 font-bold">No contacts found</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Vault' && (
                            <motion.div
                                key="Vault"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Secure Documents</h4>
                                    <button className="text-[9px] font-black text-[#AD03DE] uppercase tracking-widest hover:underline">Upload</button>
                                </div>

                                {docsLoading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400" /></div>
                                ) : documents && documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 group hover:border-[#AD03DE]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <File className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase">{doc.name}</p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{doc.document_type}</p>
                                                    </div>
                                                </div>
                                                <button className="p-3 bg-slate-50 hover:bg-[#AD03DE] text-slate-400 hover:text-white rounded-xl transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-3xl">
                                        <p className="text-xs text-slate-400 font-bold">No documents archived</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Courses' && (
                            <div className="p-8 text-center bg-slate-50 rounded-3xl">
                                <p className="text-xs text-slate-400 font-bold">Course inventory managed via Course Discovery module.</p>
                            </div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Fixed Footer */}
                <div className="p-10 bg-white border-t border-slate-100 flex gap-4">
                    <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Download Dossier PDF</button>
                    <button className="py-5 px-10 border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Archive Node</button>
                </div>
            </motion.div>
        </div>
    );
};
