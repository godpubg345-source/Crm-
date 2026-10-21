import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileCheck, ClipboardCheck, History, Plus,
    ChevronRight, CheckCircle2, AlertCircle,
    Clock, Gauge, LayoutGrid, List, FileText, Timer
} from 'lucide-react';
import reviewsService from '../../services/reviews';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const DocumentReviews = () => {
    const [activeTab, setActiveTab] = useState<'slas' | 'reviews'>('reviews');

    const slasQuery = useQuery({
        queryKey: ['reviews', 'slas'],
        queryFn: () => reviewsService.getReviewSLAs(),
    });

    const reviewsQuery = useQuery({
        queryKey: ['reviews', 'items'],
        queryFn: () => reviewsService.getDocumentReviews(),
        enabled: activeTab === 'reviews'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* QA Header */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 border border-slate-200 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-transparent" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <FileCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-semibold rounded border border-emerald-100">Reviews</span>
                            <span className="text-[11px] text-slate-500">• Service Level Assurance</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                            Document Reviews
                        </h1>
                        <p className="text-sm text-slate-500 max-w-lg mt-2 font-medium leading-relaxed">
                            Documents waiting for review, and how long reviews are taking.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Gauge className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold">Average time</span>
                        </div>
                        <span className="text-2xl font-semibold">94.2%</span>
                        <span className="text-[11px] font-bold text-emerald-400 ml-2">On target</span>
                    </div>
                </div>
            </motion.div>

            {/* Hub Navigation */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 self-start">
                    {(['slas', 'reviews'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${activeTab === tab
                                ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-500/10'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'slas' ? 'Threshold Policies' : 'Active Review Queue'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200">
                    <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"><LayoutGrid className="w-5 h-5" /></button>
                    <button className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors shadow-sm"><List className="w-5 h-5" /></button>
                </div>
            </motion.div>

            {/* Content Logic */}
            <AnimatePresence mode="wait">
                {activeTab === 'slas' ? (
                    <motion.div
                        key="slas"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {slasQuery.data?.results.map((sla) => (
                            <div key={sla.id} className="bg-white rounded-xl p-6 border border-slate-200 transition-all duration-200 group relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Timer className="w-32 h-32" />
                                </div>

                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                        <Timer className="w-6 h-6" />
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-lg border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        Review target
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-slate-900 mb-2 truncate pr-10">{(sla as any).document_category_display}</h3>
                                <div className="flex flex-col gap-6 mb-8 mt-6">
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-semibold text-slate-900 tracking-tight">{sla.target_hours}</span>
                                        <span className="text-xs font-semibold text-slate-400 pb-1">Target hours</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">
                                    How quickly documents should be reviewed. Late reviews are flagged.
                                </p>

                                <button className="w-full py-4 border border-slate-100 rounded-2xl text-[11px] font-semibold text-slate-400 group-hover:bg-violet-600 hover:bg-violet-700 group-hover:text-white group-hover:border-slate-900 transition-all">
                                    Change target
                                </button>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="reviews"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Documents</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Review time</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Difference</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {reviewsQuery.data?.results.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 group-hover:text-emerald-600 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-semibold text-slate-900 block leading-tight mb-1 tracking-tight">{review.document_details?.file_name}</span>
                                                    <span className="text-xs font-semibold text-slate-400">{review.document_details?.student_details?.full_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-slate-400">Reviewer</span>
                                                <span className="text-xs font-bold text-slate-700">{review.reviewer_details?.first_name} {review.reviewer_details?.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={`px-2 py-0.5 rounded text-xs font-semibold tracking-tight w-fit ${(review as any).is_overdue ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                                }`}>
                                                {(review as any).is_overdue ? 'Critical Delay' : 'Within Threshold'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${review.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                review.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {review.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {review.status === 'REJECTED' && <AlertCircle className="w-3.5 h-3.5" />}
                                                {review.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                                <span className="text-xs font-semibold">{review.status_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DocumentReviews;
