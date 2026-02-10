import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, GraduationCap, Clock, Banknote,
    MapPin, Calendar, Award, Scale
} from 'lucide-react';
import { clsx } from 'clsx';

interface Course {
    id: number;
    name: string;
    university_name: string;
    university_country: string;
    level: string;
    duration: string;
    tuition_fee: number;
    currency: string;
    intakes?: string;
    requirements?: string;
}

interface CompareDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    onRemove: (id: number) => void;
}

const formatCurrency = (amount: number, currency = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Side-by-Side Course Comparison Drawer
 */
export const CourseComparisonDrawer: React.FC<CompareDrawerProps> = ({
    isOpen, onClose, courses, onRemove
}) => {
    if (!isOpen || courses.length === 0) return null;

    const comparisonFields = [
        { label: 'Institution', key: 'university_name', icon: GraduationCap },
        { label: 'Country', key: 'university_country', icon: MapPin },
        { label: 'Level', key: 'level', icon: Award },
        { label: 'Duration', key: 'duration', icon: Clock },
        { label: 'Tuition Fee', key: 'tuition_fee', icon: Banknote, format: formatCurrency },
        { label: 'Intakes', key: 'intakes', icon: Calendar },
    ];

    // Find cheapest course for highlighting
    const cheapest = Math.min(...courses.map(c => c.tuition_fee));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] flex items-end justify-center"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Drawer Panel */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-6xl bg-white rounded-t-[3rem] shadow-2xl overflow-hidden max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-20 bg-white border-b border-slate-100 p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#AD03DE]/10 rounded-2xl flex items-center justify-center">
                                <Scale className="w-6 h-6 text-[#AD03DE]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tight">
                                    Course Comparison
                                </h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Analyzing {courses.length} Academic Programs
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Comparison Grid */}
                    <div className="p-8 overflow-x-auto">
                        <div className="min-w-max">
                            {/* Course Headers */}
                            <div className="grid gap-6" style={{ gridTemplateColumns: `200px repeat(${courses.length}, 1fr)` }}>
                                <div className="p-4" /> {/* Empty cell for labels column */}

                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-slate-50 rounded-3xl p-6 relative group"
                                    >
                                        <button
                                            onClick={() => onRemove(course.id)}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        >
                                            <X className="w-4 h-4 text-slate-400" />
                                        </button>

                                        <h3 className="text-lg font-serif font-black text-slate-900 leading-tight mb-2 line-clamp-2">
                                            {course.name}
                                        </h3>
                                        <p className="text-[10px] font-black text-[#AD03DE] uppercase tracking-widest">
                                            {course.university_name}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Comparison Rows */}
                            {comparisonFields.map((field, idx) => (
                                <div
                                    key={field.key}
                                    className="grid gap-6 mt-4"
                                    style={{ gridTemplateColumns: `200px repeat(${courses.length}, 1fr)` }}
                                >
                                    {/* Label Cell */}
                                    <div className={clsx(
                                        "p-4 rounded-2xl flex items-center gap-3",
                                        idx % 2 === 0 ? "bg-slate-50" : "bg-white"
                                    )}>
                                        <field.icon className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {field.label}
                                        </span>
                                    </div>

                                    {/* Value Cells */}
                                    {courses.map((course) => {
                                        const value = (course as any)[field.key];
                                        const displayValue = field.format
                                            ? field.format(value, course.currency)
                                            : value || '—';

                                        const isCheapest = field.key === 'tuition_fee' && course.tuition_fee === cheapest;

                                        return (
                                            <div
                                                key={course.id}
                                                className={clsx(
                                                    "p-4 rounded-2xl flex items-center justify-center",
                                                    idx % 2 === 0 ? "bg-slate-50" : "bg-white",
                                                    isCheapest && "ring-2 ring-emerald-500 bg-emerald-50"
                                                )}
                                            >
                                                <span className={clsx(
                                                    "text-sm font-black text-center",
                                                    isCheapest ? "text-emerald-600" : "text-slate-900"
                                                )}>
                                                    {displayValue}
                                                    {isCheapest && (
                                                        <span className="ml-2 text-[8px] bg-emerald-500 text-white px-2 py-1 rounded-full uppercase">
                                                            Best Value
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex items-center justify-between">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Pro Tip: Add up to 4 courses for detailed comparison
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Close
                            </button>
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                                Export PDF
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Floating Compare Bar (appears when courses are selected)
 */
interface CompareBarProps {
    selectedCourses: Course[];
    onCompare: () => void;
    onClear: () => void;
}

export const FloatingCompareBar: React.FC<CompareBarProps> = ({
    selectedCourses, onCompare, onClear
}) => {
    if (selectedCourses.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6"
        >
            <div className="flex items-center gap-4">
                <Scale className="w-5 h-5 text-[#AD03DE]" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {selectedCourses.length} Course{selectedCourses.length > 1 ? 's' : ''} Selected
                </span>
            </div>

            <div className="flex -space-x-2">
                {selectedCourses.slice(0, 4).map((course) => (
                    <div
                        key={course.id}
                        className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-black"
                    >
                        {course.name.charAt(0)}
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClear}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-600 transition-all"
                >
                    Clear
                </button>
                <button
                    onClick={onCompare}
                    disabled={selectedCourses.length < 2}
                    className="px-6 py-2 bg-[#AD03DE] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    Compare
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};
