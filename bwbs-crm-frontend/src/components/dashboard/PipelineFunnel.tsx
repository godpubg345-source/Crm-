import clsx from 'clsx';
import type { PipelineStat } from '../../services/dashboard';
import { Filter } from 'lucide-react';

interface PipelineFunnelProps {
    stats: PipelineStat[];
}

export const PipelineFunnel = ({ stats }: PipelineFunnelProps) => {
    // Calculate max flow for relative width
    const maxCount = Math.max(...stats.map(s => s.count), 1);

    const getWidth = (count: number) => {
        const percent = (count / maxCount) * 100;
        return Math.max(percent, 10); // Minimum 10% width
    };

    const getColor = (stage: string) => {
        if (stage.includes('APPLIED')) return 'from-blue-400 to-blue-600';
        if (stage.includes('OFFER')) return 'from-[#AD03DE] to-purple-600';
        if (stage.includes('VISA')) return 'from-amber-400 to-amber-600';
        if (stage.includes('ENROLLED')) return 'from-emerald-400 to-emerald-600';
        return 'from-slate-400 to-slate-600';
    };

    return (
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden text-white h-full flex flex-col">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#AD03DE]/20 blur-[100px] rounded-full" />

            <div className="relative z-10 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif font-black">Conversion Pipeline</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Application Lifecycle Flow</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Filter className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">
                {stats.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs uppercase tracking-widest">No Active Pipeline Data</p>
                ) : (
                    stats.map((stat) => (
                        <div key={stat.stage} className="relative group">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest mb-1 px-1">
                                <span className="text-slate-300 group-hover:text-white transition-colors">{stat.stage.replace(/_/g, ' ')}</span>
                                <span className="text-white">{stat.count}</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={clsx("h-full rounded-full bg-gradient-to-r shadow-lg relative overflow-hidden group-hover:brightness-110 transition-all duration-700 ease-out", getColor(stat.stage))}
                                    style={{ width: `${getWidth(stat.count)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/10 skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Real-time Admissions Velocity</p>
            </div>
        </div>
    );
};
