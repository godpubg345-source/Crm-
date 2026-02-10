import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => {
    const isPositive = trend && (trend.startsWith('+') || !trend.startsWith('-'));
    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, "")) || 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:border-[#AD03DE]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group cursor-default active:scale-[0.98] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-[#AD03DE]/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:to-[#AD03DE]/10 transition-colors" />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">{title}</p>
                    <h3 className="text-3xl font-serif font-extrabold text-slate-900 mt-1">
                        <AnimatedCounter value={numericValue} />
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#AD03DE] transition-all duration-500 shadow-inner group-hover:shadow-[#AD03DE]/20 group-hover:-rotate-6">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </div>

            {trend && (
                <div className="mt-6 flex items-center text-[10px] font-bold uppercase tracking-wider relative z-10">
                    <span className={clsx(
                        "px-2 py-0.5 rounded-md",
                        isPositive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                        {trend}
                    </span>
                    <span className="text-slate-500 ml-2">vs period</span>
                </div>
            )}
        </div>
    );
};
