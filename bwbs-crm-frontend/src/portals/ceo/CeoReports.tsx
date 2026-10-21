import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
    FileText, Download, Briefcase, Calendar, ShieldCheck,
    CheckCircle2, Clock, Filter, Sparkles, FileSpreadsheet,
    Printer, Share2, Layers, AlertCircle
} from 'lucide-react';

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

const BOARD_REPORTS = [
    {
        id: 'REP-2026-Q3',
        title: 'Q3 FY2026 Board Executive Strategy Dossier',
        category: 'GOVERNANCE',
        date: '15 Sep 2026',
        pages: '42 Pages',
        format: 'PDF',
        size: '8.4 MB',
        author: 'Office of the CEO & CFO',
        status: 'RATIFIED',
        description: 'Comprehensive quarterly review of student acquisition velocity, institutional partnerships, and regional P&L margins.',
    },
    {
        id: 'REP-2026-VSA',
        title: 'Global Visa Compliance & Sponsor License Audit',
        category: 'COMPLIANCE',
        date: '10 Sep 2026',
        pages: '18 Pages',
        format: 'PDF',
        size: '3.1 MB',
        author: 'Legal & Immigration Bureau',
        status: 'RATIFIED',
        description: 'Pre-inspection audit assessing Home Office CAS compliance, student attendance tracking, and international visa grant ratios.',
    },
    {
        id: 'REP-2026-UNI',
        title: 'University Partner Commission Settlement Schedule',
        category: 'FINANCE',
        date: '08 Sep 2026',
        pages: '3 Sheets',
        format: 'XLSX',
        size: '1.4 MB',
        author: 'Finance & Accounts',
        status: 'AUDITED',
        description: 'Direct university invoice reconciliation, commission receivable ledgers, and intake volume milestones.',
    },
    {
        id: 'REP-2026-BPL',
        title: 'Branch P&L and Regional Profitability Breakdown',
        category: 'OPERATIONS',
        date: '01 Sep 2026',
        pages: '28 Pages',
        format: 'PDF',
        size: '5.2 MB',
        author: 'Global Operations Desk',
        status: 'RATIFIED',
        description: 'Branch-by-branch cost-to-income ratios, counselor productivity indices, and regional operational yield.',
    },
];

const CeoReports = () => {
    const [generating, setGenerating] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

    const handleDownload = (id: string, title: string) => {
        setDownloadSuccess(id);
        setTimeout(() => setDownloadSuccess(null), 3000);
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            alert('Custom Strategic Report compiled successfully! Downloading executive dossier.');
        }, 1200);
    };

    const filteredReports = selectedCategory === 'ALL'
        ? BOARD_REPORTS
        : BOARD_REPORTS.filter(r => r.category === selectedCategory);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7 max-w-[1500px] mx-auto pb-16"
        >
            {/* ── HEADER ────────────────────────────────────────────── */}
            <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                            Executive Archive
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-white/40 text-xs font-semibold">Boardroom Strategy & Audits</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Strategic Reports</h1>
                    <p className="text-white/40 text-xs mt-1">Official board dossiers, statutory immigration compliance logs & partner commission ledgers.</p>
                </div>

                <div className="flex bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                    {['ALL', 'GOVERNANCE', 'FINANCE', 'COMPLIANCE', 'OPERATIONS'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                selectedCategory === cat
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-white/40 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── CUSTOM REPORT BUILDER BOX ──────────────────────────── */}
            <motion.div variants={item} className="rounded-[2.2rem] p-8 border border-white/[0.08] bg-gradient-to-r from-amber-500/[0.07] via-white/[0.02] to-indigo-500/[0.05] relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
                            <Sparkles className="w-4 h-4" />
                            Dynamic Executive Dossier Generator
                        </div>
                        <h2 className="text-2xl font-black text-white">Generate Tailored Board Presentation</h2>
                        <p className="text-white/40 text-xs mt-1 max-w-xl">
                            Consolidate real-time financial, branch performance and visa approval data into a presentation-ready executive briefing.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select className="px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-2xl text-xs text-white focus:outline-none font-bold">
                            <option value="all" className="bg-[#0d0a1a]">Global Overview (All Regions)</option>
                            <option value="uk" className="bg-[#0d0a1a]">UK & European Territory</option>
                            <option value="me" className="bg-[#0d0a1a]">Middle East Hub</option>
                            <option value="asia" className="bg-[#0d0a1a]">South Asia Operations</option>
                        </select>

                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                        >
                            {generating ? (
                                <>Compiling Dossier...</>
                            ) : (
                                <>
                                    <Printer className="w-4 h-4" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── REPORTS LISTING ────────────────────────────────────── */}
            <div className="space-y-4">
                {filteredReports.map((r) => (
                    <motion.div
                        key={r.id}
                        variants={item}
                        className="rounded-[2rem] p-7 border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                                {r.format === 'PDF' ? (
                                    <FileText className="w-6 h-6 text-amber-400" />
                                ) : (
                                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-wider border border-amber-500/20">
                                        {r.category}
                                    </span>
                                    <span className="text-white/30 text-xs">•</span>
                                    <span className="text-xs text-white/40 font-bold">{r.id}</span>
                                    <span className="text-white/30 text-xs">•</span>
                                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {r.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-white">{r.title}</h3>
                                <p className="text-xs text-white/40 font-medium mt-1 leading-relaxed max-w-2xl">{r.description}</p>
                                <div className="flex items-center gap-4 text-[11px] text-white/30 font-semibold mt-3">
                                    <span>Date: <b className="text-white/60">{r.date}</b></span>
                                    <span>Volume: <b className="text-white/60">{r.pages}</b></span>
                                    <span>Size: <b className="text-white/60">{r.size}</b></span>
                                    <span>Issued By: <b className="text-white/60">{r.author}</b></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                            <button
                                onClick={() => handleDownload(r.id, r.title)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                    downloadSuccess === r.id
                                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]'
                                }`}
                            >
                                <Download className="w-4 h-4" />
                                {downloadSuccess === r.id ? 'Exported!' : `Download ${r.format}`}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default CeoReports;
