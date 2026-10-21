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
                className="absolute inset-0 bg-slate-900/60"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]"
            >
                {/* Status Sidebar */}
                <div className="w-full md:w-80 bg-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Building className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white tracking-tight">Add university</h3>
                                <p className="text-xs font-semibold text-slate-400">Add university</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {[
                                { n: 1, label: 'Institution Profile', icon: Building },
                                { n: 2, label: 'Partnership Terms', icon: Shield },
                                { n: 3, label: 'Contacts', icon: Users },
                                { n: 4, label: 'Requirements', icon: Zap }
                            ].map((s) => (
                                <div key={s.n} className="flex items-center gap-4 group">
                                    <div className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
                                        step === s.n ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm scale-110" :
                                            step > s.n ? "bg-emerald-500 border-emerald-500 text-white" :
                                                "bg-transparent border-slate-700 text-slate-500"
                                    )}>
                                        {step > s.n ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className={clsx(
                                            "text-xs font-semibold leading-none",
                                            step === s.n ? "text-white" : "text-slate-500"
                                        )}>{s.label}</p>
                                        <p className="text-[11px] font-bold text-slate-600 mt-1">Step 0{s.n}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-slate-800">
                        <p className="text-[11px] font-bold text-slate-500 mb-4">Step</p>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#7c3aed]"
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white p-6 flex flex-col h-full relative">
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
                                className="space-y-6"
                            >
                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Identity</h2>
                                            <p className="text-xs text-slate-500">Basic details</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Institution Name</label>
                                                <input type="text" placeholder="e.g. University of London" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Website</label>
                                                <input type="text" placeholder="www.university.ac.uk" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">City</label>
                                                <input type="text" placeholder="London" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Country</label>
                                                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all">
                                                    <option>United Kingdom</option>
                                                    <option>United States</option>
                                                    <option>Canada</option>
                                                    <option>Australia</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-[#7c3aed]/20 transition-all cursor-pointer">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform">
                                                <Globe className="w-5 h-5 text-slate-400 group-hover:text-[#7c3aed]" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-400">Upload logo</p>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Contract</h2>
                                            <p className="text-xs text-slate-500">Commission and contract</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Base Commission (%)</label>
                                                <input type="number" placeholder="10.0" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Contract Start</label>
                                                <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="md:col-span-2 p-6 bg-purple-50/30 rounded-2xl border border-purple-100 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="w-5 h-5 text-[#7c3aed]" />
                                                    <h4 className="text-sm font-semibold text-slate-900">Exclusive</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">Are you their only agent in your region?</p>
                                                <div className="flex gap-4">
                                                    <button className="flex-1 py-4 bg-white border border-[#7c3aed] text-[#7c3aed] rounded-xl text-xs font-semibold transition-all">Exclusive</button>
                                                    <button className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-semibold transition-all">Not exclusive</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Contacts</h2>
                                            <p className="text-xs text-slate-500">People you work with</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                    <Users className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <input type="text" placeholder="NAME" className="bg-transparent text-xs font-semibold p-2 border-b border-slate-200 focus:border-[#7c3aed] outline-none" />
                                                    <input type="text" placeholder="ROLE" className="bg-transparent text-xs font-semibold p-2 border-b border-slate-200 focus:border-[#7c3aed] outline-none" />
                                                </div>
                                            </div>
                                            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[11px] font-semibold text-slate-400 hover:border-[#7c3aed]/30 hover:text-[#7c3aed] transition-all flex items-center justify-center gap-2">
                                                <Zap className="w-3.5 h-3.5" />
                                                Add contact
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Admission</h2>
                                            <p className="text-xs text-slate-500">Entry requirements</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Min. academic Score (%)</label>
                                                <input type="number" placeholder="60" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Min. IELTS Overall</label>
                                                <input type="number" placeholder="6.0" step="0.5" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">Accepted Study Gap (Years)</label>
                                                <input type="number" placeholder="2" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-slate-400">accepted countries</label>
                                                <input type="text" placeholder="GLOBAL" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/10 transition-all" />
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
                            className="px-8 py-4 text-slate-400 hover:text-slate-900 font-semibold text-xs transition-all disabled:opacity-0 flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        {step < totalSteps ? (
                            <button
                                onClick={nextStep}
                                className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 shadow-sm transition-all flex items-center gap-3"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    console.log('Finalizing Onboarding - Mock Submission');
                                    onClose();
                                }}
                                className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-sm transition-all flex items-center gap-3"
                            >
                                Save university
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
                className="absolute inset-0 bg-slate-900/60"
            />

            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-slate-50 shadow-sm overflow-hidden flex flex-col h-full border-l border-slate-100"
            >
                {/* Header Section */}
                <div className="relative h-64 bg-slate-900 overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/30 to-indigo-900/40" />
                    <div className="absolute top-0 right-0 p-6">
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-6 flex items-end justify-between gap-6 translate-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-center">
                                {university.logo ? (
                                    <img src={university.logo} alt={university.name} className="w-full h-full object-contain" />
                                ) : (
                                    <Building className="w-10 h-10 text-slate-200" />
                                )}
                            </div>
                            <div className="mb-8">
                                <h2 className="text-3xl font-semibold text-white tracking-tight leading-none">{university.name}</h2>
                                <p className="text-xs font-semibold text-[#7c3aed] mt-3">University details</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 mt-6 space-y-6">
                    {/* Key Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-6 bg-white rounded-xl border border-slate-200">
                            <p className="text-[11px] font-semibold text-slate-300 mb-1">Growth</p>
                            <p className="text-xl font-semibold text-slate-900">{university.course_count || 0} Courses</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-slate-200">
                            <p className="text-[11px] font-semibold text-slate-300 mb-1">Fee Tier</p>
                            <p className="text-xl font-semibold text-slate-900">£12k-18k</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-slate-200">
                            <p className="text-[11px] font-semibold text-slate-300 mb-1">Commission</p>
                            <p className="text-xl font-semibold text-[#7c3aed]">{university.commission_rate || '12.5'}%</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex p-1 bg-slate-200/50 rounded-2xl border border-slate-200">
                        {['Overview', 'Courses', 'Vault', 'Contacts'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl text-[11px] font-semibold transition-all",
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
                                    <h4 className="text-sm font-semibold text-slate-900">Requirements</h4>
                                    <button className="text-[11px] font-semibold text-[#7c3aed] hover:underline">Edit</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Min. Percentage', value: university.admission_criteria?.min_percentage ? university.admission_criteria.min_percentage + '%' : '60%', icon: Globe },
                                        { label: 'Min. IELTS', value: university.admission_criteria?.min_ielts || '6.0', icon: FileText },
                                        { label: 'Max study gap', value: university.admission_criteria?.gap_limit ? university.admission_criteria.gap_limit + ' Years' : '2 Years', icon: TrendingUp },
                                        { label: 'Next intake', value: 'SEP 2025', icon: Calendar }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#7c3aed] transition-colors">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold text-slate-400 leading-none mb-1">{item.label}</p>
                                                <p className="text-xs font-semibold text-slate-900">{item.value}</p>
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
                                    <h4 className="text-sm font-semibold text-slate-900">Contacts</h4>
                                    <button className="text-[11px] font-semibold text-[#7c3aed] hover:underline">Add New</button>
                                </div>

                                {contactsLoading ? (
                                    <div className="flex justify-center p-6"><Loader2 className="animate-spin text-slate-400" /></div>
                                ) : contacts && contacts.length > 0 ? (
                                    <div className="space-y-3">
                                        {contacts.map((contact: any) => (
                                            <div key={contact.id} className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center font-semibold text-[#7c3aed] text-xs">
                                                        {contact.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900">{contact.name}</p>
                                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{contact.role}</p>
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
                                    <div className="p-6 text-center bg-slate-50 rounded-2xl">
                                        <p className="text-xs text-slate-500">No contacts found</p>
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
                                    <h4 className="text-sm font-semibold text-slate-900">Documents</h4>
                                    <button className="text-[11px] font-semibold text-[#7c3aed] hover:underline">Upload</button>
                                </div>

                                {docsLoading ? (
                                    <div className="flex justify-center p-6"><Loader2 className="animate-spin text-slate-400" /></div>
                                ) : documents && documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="flex items-center justify-between p-6 bg-white rounded-xl border border-slate-200 group hover:border-[#7c3aed]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <File className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-900">{doc.name}</p>
                                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{doc.document_type}</p>
                                                    </div>
                                                </div>
                                                <button className="p-3 bg-slate-50 hover:bg-[#7c3aed] text-slate-400 hover:text-white rounded-xl transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center bg-slate-50 rounded-2xl">
                                        <p className="text-xs text-slate-500">No documents yet</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'Courses' && (
                            <div className="p-6 text-center bg-slate-50 rounded-2xl">
                                <p className="text-xs text-slate-500">Manage courses from Find courses.</p>
                            </div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Fixed Footer */}
                <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                    <button className="flex-1 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-all">Download PDF</button>
                    <button className="py-5 px-6 border-2 border-slate-900 text-slate-900 rounded-2xl text-xs font-semibold hover:bg-slate-50 transition-all">Archive</button>
                </div>
            </motion.div>
        </div>
    );
};
