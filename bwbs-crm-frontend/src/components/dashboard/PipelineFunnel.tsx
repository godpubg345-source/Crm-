import type { PipelineStat } from '../../services/dashboard';

interface PipelineFunnelProps {
    stats: PipelineStat[];
}

// Application stages in journey order (mirrors backend Application.Status)
const STAGE_ORDER = [
    'DRAFT', 'DOCUMENTS_READY', 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED',
    'CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'DEPOSIT_PAID', 'OFFER_ACCEPTED',
    'CAS_REQUESTED', 'CAS_RECEIVED', 'VISA_APPLIED', 'ENROLLED',
    'OFFER_DECLINED', 'REJECTED', 'WITHDRAWN',
];

const barColor = (stage: string) => {
    if (stage === 'ENROLLED') return 'bg-emerald-500';
    if (['REJECTED', 'WITHDRAWN', 'OFFER_DECLINED'].includes(stage)) return 'bg-slate-300';
    if (stage.includes('OFFER') || stage === 'DEPOSIT_PAID') return 'bg-violet-500';
    if (stage.includes('CAS') || stage.includes('VISA')) return 'bg-amber-500';
    return 'bg-sky-500';
};

const label = (stage: string) => {
    const text = stage.replace(/_/g, ' ').toLowerCase();
    return text.replace(/\bcas\b/g, 'CAS').replace(/^\w/, (c) => c.toUpperCase());
};

export const PipelineFunnel = ({ stats }: PipelineFunnelProps) => {
    const ordered = [...stats].sort((a, b) => {
        const ia = STAGE_ORDER.indexOf(a.stage);
        const ib = STAGE_ORDER.indexOf(b.stage);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const maxCount = Math.max(...stats.map((s) => s.count), 1);
    const total = stats.reduce((sum, s) => sum + s.count, 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col">
            <div className="mb-4 flex items-baseline justify-between">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Applications by stage</h3>
                    <p className="text-sm text-slate-500">Where every application is right now</p>
                </div>
                <span className="text-sm text-slate-500 tabular-nums">{total} total</span>
            </div>

            {ordered.length === 0 ? (
                <p className="flex-1 flex items-center justify-center text-sm text-slate-400">No applications yet</p>
            ) : (
                <div className="space-y-2.5">
                    {ordered.map((stat) => (
                        <div key={stat.stage} className="grid grid-cols-[160px_1fr_32px] items-center gap-3">
                            <span className="text-sm text-slate-600 truncate">{label(stat.stage)}</span>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${barColor(stat.stage)}`}
                                    style={{ width: `${Math.max((stat.count / maxCount) * 100, 4)}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-900 text-right tabular-nums">{stat.count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
