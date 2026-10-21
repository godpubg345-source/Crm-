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
        <div className="bg-white rounded-xl p-6 border border-border hover:border-[#7c3aed]/40 transition-all duration-200 group cursor-default relative overflow-hidden">

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-slate-600 text-xs font-semibold mb-1.5">{title}</p>
                    <h3 className="text-3xl font-semibold text-slate-900 mt-1">
                        <AnimatedCounter value={numericValue} />
                    </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#7c3aed] transition-all duration-200">
                    <Icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </div>

            {trend && (
                <div className="mt-6 flex items-center text-xs font-bold relative z-10">
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
