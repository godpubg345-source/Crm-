import clsx from 'clsx';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    trend: string;
}

const KPICard = ({ label, value, icon: Icon, color, trend }: KPICardProps) => {
    // Extract base color class for background/text mapping 
    // This is a simplification; for production, a dedicated color map prop is better
    // but assuming 'color' is like 'bg-indigo-50 text-indigo-600'

    return (
        <div className="relative group bg-white rounded-xl p-6 border border-slate-200 transition-all duration-200 hover:border-[#7c3aed]/20 overflow-hidden">

            <div className="relative z-10 flex items-start justify-between mb-8">
                <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm",
                    color // using the passed color classes directly
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-1.5 group-hover:bg-[#7c3aed] group-hover:border-[#7c3aed] group-hover:text-white transition-all duration-300">
                        <span className="text-xs font-semibold">{trend}</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h4 className="text-xs font-semibold text-slate-400 mb-2 group-hover:text-[#7c3aed] transition-colors">{label}</h4>
                <p className="text-3xl font-semibold text-slate-900 tracking-tight origin-left transition-transform duration-200">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default KPICard;
