import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUniversities } from '../services/universities';
import {
    Building,
    Search,
    Plus,
    MoreVertical,
    MapPin,
    Globe,
    TrendingUp,
    Shield,
    Users,
    GraduationCap,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { OnboardingWizard, UniversityDossier } from '../components/universities/UniversityModals';
import { SmartMatchModal } from '../components/universities/SmartMatchModal';
import { IntakeCalendar, UniversityAnalytics } from '../components/universities/IntakeCalendar';
import { SmartCommissionForecast } from '../components/universities/CommissionForecast';
import CourseFinder from './CourseFinder';

const UniversityPartner = () => {
    // -------------------------------------------------------------------------
    // STATE & NAVIGATION
    // -------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState<'portfolio' | 'discovery' | 'analytics' | 'intakes'>('portfolio');
    const [showForecast, setShowForecast] = useState(false);

    // Modal States
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [isMatchOpen, setIsMatchOpen] = useState(false);
    const [selectedUni, setSelectedUni] = useState<any>(null);

    // Portfolio State
    const [uniSearch, setUniSearch] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');

    // Discovery tab now uses embedded CourseFinder component

    // -------------------------------------------------------------------------
    // DATA FETCHING
    // -------------------------------------------------------------------------
    const { data: uniData, isLoading: uniLoading } = useQuery({
        queryKey: ['universities', uniSearch, selectedRegion],
        queryFn: () => getUniversities({
            search: uniSearch,
            country: selectedRegion === 'All' ? undefined : selectedRegion
        }),
        enabled: activeTab === 'portfolio' || activeTab === 'analytics'
    });

    const regions = ['All', 'UK', 'USA', 'Canada', 'Australia', 'Other'];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 ease-out pb-10">
            {/* -----------------------------------------------------------------
                EXECUTIVE HEADER
            ----------------------------------------------------------------- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-12 bg-gradient-to-b from-[#AD03DE] to-indigo-600 rounded-full shadow-[0_0_20px_rgba(173,3,222,0.4)]" />
                        <h1 className="text-6xl font-serif font-black text-slate-900 tracking-tighter leading-none uppercase">
                            University <span className="text-[#AD03DE]">Global</span>
                        </h1>
                    </div>
                    <p className="text-sm font-serif font-bold text-slate-400 max-w-md ml-6">
                        Strategic institutional hub. Manage global partners and discover academic opportunities through unified intelligence.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mode Switcher */}
                    <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={clsx(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'portfolio'
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Building className="w-3.5 h-3.5" />
                            Portfolio
                        </button>
                        <button
                            onClick={() => setActiveTab('discovery')}
                            className={clsx(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'discovery'
                                    ? "bg-white text-[#AD03DE] shadow-md ring-1 ring-purple-50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Discovery
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={clsx(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'analytics'
                                    ? "bg-white text-emerald-600 shadow-md ring-1 ring-emerald-50"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            HQ Analytics
                        </button>
                    </div>

                    {activeTab === 'portfolio' && (
                        <button
                            onClick={() => setIsOnboardOpen(true)}
                            className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-slate-200"
                        >
                            <Plus className="w-4 h-4 text-emerald-400" />
                            Onboard
                        </button>
                    )}

                    {activeTab === 'discovery' && (
                        <button
                            onClick={() => setIsMatchOpen(true)}
                            className="px-8 py-4 bg-[#AD03DE] hover:bg-purple-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-purple-200"
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                            Smart Match
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'portfolio' ? (
                    <motion.div
                        key="portfolio"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Strategic Analytics Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Partners', value: uniData?.count || '0', icon: Building, color: 'slate' },
                                { label: 'Network Reach', value: '42 Cities', icon: Globe, color: 'indigo' },
                                { label: 'Avg Commission', value: '12.5%', icon: TrendingUp, color: 'emerald' },
                                { label: 'Compliance Rate', value: '98%', icon: Shield, color: 'purple' },
                            ].map((stat, i) => (
                                <div key={i} className="p-8 bg-white border border-slate-100/80 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                                        <stat.icon className="w-16 h-16" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                    <p className="text-3xl font-serif font-black text-slate-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filters & Control Deck */}
                        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white flex flex-col md:flex-row gap-6 shadow-sm">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#AD03DE] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH PARTNER REALM..."
                                    value={uniSearch}
                                    onChange={(e) => setUniSearch(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#AD03DE]/10 transition-all uppercase tracking-widest"
                                />
                            </div>

                            <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-[1.5rem] border border-slate-100">
                                {regions.map(region => (
                                    <button
                                        key={region}
                                        onClick={() => setSelectedRegion(region)}
                                        className={clsx(
                                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            selectedRegion === region
                                                ? "bg-white text-[#AD03DE] shadow-sm"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Partner Inventory Grid */}
                        {uniLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-64 bg-slate-100 rounded-[3rem] animate-pulse" />
                                ))}
                            </div>
                        ) : uniData?.results?.length === 0 ? (
                            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[4rem] border border-dashed border-slate-200">
                                <Building className="w-16 h-16 text-slate-100 mb-6" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">No matching institutions found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {uniData?.results.map((uni: any) => (
                                    <motion.div
                                        key={uni.id}
                                        whileHover={{ y: -8 }}
                                        className="bg-white p-10 rounded-[3.5rem] border border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#AD03DE]/5 transition-colors duration-700" />

                                        <div className="relative z-10 h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:bg-white group-hover:shadow-lg group-hover:-rotate-6 transition-all duration-700">
                                                    {uni.logo ? (
                                                        <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                    ) : (
                                                        <Building className="w-8 h-8 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={clsx(
                                                        "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                        uni.is_partner
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : "bg-slate-50 text-slate-400 border-slate-100"
                                                    )}>
                                                        {uni.is_partner ? 'Partner Node' : 'Standard Node'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                        <MapPin className="w-3 h-3" />
                                                        {uni.country_display}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-2xl font-serif font-black text-slate-900 leading-tight mb-4 group-hover:text-[#AD03DE] transition-colors">{uni.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Globe className="w-3 h-3" />
                                                    {uni.city || 'Global Operations'}
                                                </p>
                                            </div>

                                            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Growth Vector</p>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                        <span className="text-sm font-black text-slate-900">{uni.course_count} Courses</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setSelectedUni(uni); setIsDossierOpen(true); }}
                                                        className="px-4 py-2 bg-slate-50 hover:bg-[#AD03DE] text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-[#AD03DE]"
                                                    >
                                                        Details
                                                    </button>
                                                    <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : activeTab === 'discovery' ? (
                    <motion.div
                        key="discovery"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                    >
                        <CourseFinder />
                    </motion.div>
                ) : activeTab === 'analytics' ? (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {showForecast ? (
                            <SmartCommissionForecast onBack={() => setShowForecast(false)} />
                        ) : (
                            <UniversityAnalytics onViewForecast={() => setShowForecast(true)} />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="intakes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <IntakeCalendar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals Positioning */}
            <OnboardingWizard isOpen={isOnboardOpen} onClose={() => setIsOnboardOpen(false)} />
            <UniversityDossier
                isOpen={isDossierOpen}
                onClose={() => { setIsDossierOpen(false); setSelectedUni(null); }}
                university={selectedUni}
            />
            <SmartMatchModal
                isOpen={isMatchOpen}
                onClose={() => setIsMatchOpen(false)}
                onMatch={(profile) => {
                    console.log('Smart Match Profile:', profile);
                    setIsMatchOpen(false);
                    // Smart matching now handled by CourseFinder component
                    setActiveTab('discovery');
                }}
            />
        </div>
    );
};

export default UniversityPartner;
