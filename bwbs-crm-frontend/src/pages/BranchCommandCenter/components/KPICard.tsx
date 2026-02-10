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
        <div className="relative group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#AD03DE]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:to-[#AD03DE]/5 transition-colors duration-700" />

            <div className="relative z-10 flex items-start justify-between mb-8">
                <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                    color // using the passed color classes directly
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-1.5 group-hover:bg-[#AD03DE] group-hover:border-[#AD03DE] group-hover:text-white transition-all duration-300">
                        <span className="text-[10px] font-black uppercase tracking-widest">{trend}</span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 group-hover:text-[#AD03DE] transition-colors">{label}</h4>
                <p className="text-4xl font-serif font-black text-slate-900 tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-500">
                    {value}
                </p>
            </div>
        </div>
    );
};

export default KPICard;
