import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import {
    Globe, Building2, Users, BadgeDollarSign, MapPin,
    Phone, Mail, CheckCircle2, AlertCircle, ArrowUpRight,
    Search, Filter, Plus, ShieldCheck
} from 'lucide-react';
import { getBranches } from '../../services/branches';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

const STATIC_BRANCHES = [
    {
        id: 'br-1',
        name: 'London Global Headquarters',
        code: 'UK-LON',
        city: 'London',
        country: 'United Kingdom',
        manager: 'David Richardson',
        phone: '+44 20 7946 0912',
        email: 'london.hq@bwbs.com',
        counselors: 18,
        students: 342,
        revenue: '£184,000',
        targetHit: '108%',
        status: 'ACTIVE',
        rating: '4.9 ★',
        isHq: true,
    },
    {
        id: 'br-2',
        name: 'Dubai Executive Hub',
        code: 'UAE-DXB',
        city: 'Dubai',
        country: 'United Arab Emirates',
        manager: 'Rashid Al-Maktoum',
        phone: '+971 4 312 8900',
        email: 'dubai@bwbs.com',
        counselors: 12,
        students: 215,
        revenue: '£96,000',
        targetHit: '102%',
        status: 'ACTIVE',
        rating: '4.8 ★',
        isHq: false,
    },
    {
        id: 'br-3',
        name: 'Dhaka Regional Centre',
        code: 'BD-DAC',
        city: 'Dhaka',
        country: 'Bangladesh',
        manager: 'Tanvir Hossain',
        phone: '+880 2 988 4120',
        email: 'dhaka@bwbs.com',
        counselors: 14,
        students: 280,
        revenue: '£74,000',
        targetHit: '98%',
        status: 'ACTIVE',
        rating: '4.7 ★',
        isHq: false,
    },
    {
        id: 'br-4',
        name: 'Manchester Northern Office',
        code: 'UK-MAN',
        city: 'Manchester',
        country: 'United Kingdom',
        manager: 'Emma Butterworth',
        phone: '+44 161 832 9011',
        email: 'manchester@bwbs.com',
        counselors: 8,
        students: 140,
        revenue: '£52,000',
        targetHit: '95%',
        status: 'ACTIVE',
        rating: '4.8 ★',
        isHq: false,
    },
    {
        id: 'br-5',
        name: 'Islamabad Liaison Bureau',
        code: 'PK-ISB',
        city: 'Islamabad',
        country: 'Pakistan',
        manager: 'Zahid Mehmood',
        phone: '+92 51 287 4001',
        email: 'islamabad@bwbs.com',
        counselors: 11,
        students: 195,
        revenue: '£48,000',
        targetHit: '93%',
        status: 'ACTIVE',
        rating: '4.7 ★',
        isHq: false,
    },
    {
        id: 'br-6',
        name: 'Lagos West Africa Hub',
        code: 'NG-LOS',
        city: 'Lagos',
        country: 'Nigeria',
        manager: 'Chukwudi Okonjo',
        phone: '+234 1 764 9012',
        email: 'lagos@bwbs.com',
        counselors: 9,
        students: 165,
        revenue: '£42,000',
        targetHit: '91%',
        status: 'ACTIVE',
        rating: '4.6 ★',
        isHq: false,
    },
];

const CeoBranches = () => {
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('ALL');

    const { data: apiBranches } = useQuery({
        queryKey: ['branchesList'],
        queryFn: () => getBranches(),
        retry: 1,
    });

    const displayBranches = STATIC_BRANCHES.filter((b) => {
        const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                              b.city.toLowerCase().includes(search.toLowerCase()) ||
                              b.country.toLowerCase().includes(search.toLowerCase());
        const matchesRegion = regionFilter === 'ALL' ||
            (regionFilter === 'UK' && b.country === 'United Kingdom') ||
            (regionFilter === 'ME' && b.country.includes('Emirates')) ||
            (regionFilter === 'ASIA' && (b.country === 'Bangladesh' || b.country === 'Pakistan')) ||
            (regionFilter === 'AFRICA' && b.country === 'Nigeria');

        return matchesSearch && matchesRegion;
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HEADER & CONTROLS ─────────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                            Global Footprint
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">6 Multi-National Campuses</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Branch Network</h1>
                    <p className="text-white/40 text-xs mt-1">Cross-jurisdiction branch governance, financial yields & staff allocation.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search branch or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 w-60"
                        />
                    </div>

                    <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                        {[
                            { id: 'ALL', label: 'All' },
                            { id: 'UK', label: 'UK' },
                            { id: 'ASIA', label: 'Asia' },
                            { id: 'ME', label: 'UAE' },
                            { id: 'AFRICA', label: 'Africa' },
                        ].map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRegionFilter(r.id)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                    regionFilter === r.id
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'text-white/40 hover:text-white'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── TOP KPI TILES ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Active Global Offices', val: '6 Hubs', sub: 'Across 5 Nations', icon: Building2, color: 'from-amber-500/20' },
                    { label: 'Total Global Counselors', val: '72 Staff', sub: 'In Active Roster', icon: Users, color: 'from-indigo-500/20' },
                    { label: 'Total Active Pipeline', val: '1,337 Students', sub: '+84 Enrolled This Month', icon: Globe, color: 'from-emerald-500/20' },
                    { label: 'Network Target Velocity', val: '98.4%', sub: 'Target Attainment', icon: ShieldCheck, color: 'from-purple-500/20' },
                ].map((m) => (
                    <motion.div
                        key={m.label}
                        variants={item}
                        className="rounded-[2rem] p-7 border border-white/[0.07] bg-white/[0.03] relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                <m.icon className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.25em]">{m.label}</p>
                        <p className="text-3xl font-black text-white mt-1">{m.val}</p>
                        <p className="text-xs text-white/40 font-semibold mt-1">{m.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── BRANCH CARDS GRID ───────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayBranches.map((branch) => (
                    <motion.div
                        key={branch.id}
                        variants={item}
                        whileHover={{ y: -4 }}
                        className={`rounded-[2.2rem] p-7 border relative overflow-hidden transition-all duration-300 ${
                            branch.isHq
                                ? 'bg-gradient-to-br from-amber-500/[0.08] to-white/[0.02] border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.06)]'
                                : 'bg-white/[0.03] border-white/[0.07] hover:border-white/20'
                        }`}
                    >
                        {branch.isHq && (
                            <div className="absolute top-0 right-0 px-5 py-1.5 bg-gradient-to-l from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-[0.25em] rounded-bl-2xl shadow-lg">
                                Global HQ
                            </div>
                        )}

                        {/* Top: Name & Location */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {branch.city}, {branch.country}
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight leading-snug">{branch.name}</h3>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{branch.code}</span>
                        </div>

                        {/* Middle: Metrics grid */}
                        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/30 border border-white/[0.05] mb-6 text-center">
                            <div>
                                <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Students</p>
                                <p className="text-base font-black text-white mt-1">{branch.students}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Revenue</p>
                                <p className="text-base font-black text-amber-400 mt-1">{branch.revenue}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Target</p>
                                <p className="text-base font-black text-emerald-400 mt-1">{branch.targetHit}</p>
                            </div>
                        </div>

                        {/* Contact & Manager info */}
                        <div className="space-y-2 text-xs text-white/50 border-t border-white/[0.06] pt-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white/30 text-[11px]">Branch Director:</span>
                                <span className="font-bold text-white/80">{branch.manager}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white/30 text-[11px]">Active Team:</span>
                                <span className="font-bold text-white/80">{branch.counselors} Counselors</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-white/30 text-[11px]">Audit Rating:</span>
                                <span className="font-black text-amber-300">{branch.rating}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default CeoBranches;
