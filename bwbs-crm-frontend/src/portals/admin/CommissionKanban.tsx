import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
    getClaims,
    updateClaimStatus,
    getCommissionStats,
    type CommissionClaim,
    type CommissionStatus
} from '../../services/finance';
import {
    Loader2,
    TrendingUp,
    ShieldCheck,
    Clock,
    Building,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// COMMISSION KANBAN - FINANCIAL ASSET PIPELINE
// ============================================================================

const COLUMNS: { id: CommissionStatus; title: string; icon: any; color: string; accent: string }[] = [
    { id: 'PENDING', title: 'Pending', icon: Clock, color: 'bg-slate-50 text-slate-400 border-slate-100', accent: 'bg-slate-400' },
    { id: 'INVOICED', title: 'Invoiced', icon: ShieldCheck, color: 'bg-blue-50 text-blue-500 border-blue-100', accent: 'bg-blue-500' },
    { id: 'RECEIVED', title: 'Paid', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500 border-emerald-100', accent: 'bg-emerald-500' },
    { id: 'REJECTED', title: 'Rejected', icon: AlertCircle, color: 'bg-rose-50 text-rose-500 border-rose-100', accent: 'bg-rose-500' },
];

const CommissionKanban = () => {
    const queryClient = useQueryClient();
    const [activeId, setActiveId] = useState<string | null>(null);

    const { data: claimsData, isLoading } = useQuery({
        queryKey: ['claims', 'kanban'],
        queryFn: () => getClaims({ page: 1 }), // We'll handle pagination or fetch all for kanban
    });

    const claims = claimsData?.results || [];

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: CommissionStatus }) =>
            updateClaimStatus(id, status, new Date().toISOString().split('T')[0]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            queryClient.invalidateQueries({ queryKey: ['commission-stats'] });
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeClaim = claims.find(c => c.id === activeId);
        if (!activeClaim) return;

        const overColumn = COLUMNS.find(col => col.id === overId);
        if (overColumn && activeClaim.status !== overColumn.id) {
            statusMutation.mutate({ id: activeId, status: overColumn.id });
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs text-slate-500">Loading commissions...</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden animate-in fade-in duration-200 ease-out relative">

            {/* Header */}
            <div className="flex flex-col mb-6 px-1 relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">Commissions</h1>
                </div>
                <p className="text-xs font-semibold text-slate-600 ml-6 opacity-80">Track commission claims from universities</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto pb-12 premium-scrollbar ps-1 pe-4 relative z-10">
                    <div className="flex gap-6 h-full min-w-max">
                        {COLUMNS.map(column => (
                            <div
                                id={column.id}
                                key={column.id}
                                className="w-[400px] flex flex-col bg-white rounded-2xl p-6 border border-slate-100/80 group/col hover:border-[#7c3aed]/10 transition-all duration-200"
                            >
                                {/* Column Header */}
                                <div className="flex items-center gap-6 mb-6 px-2">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-700 group-hover/${column.color}`}>
                                        <column.icon className="w-7 h-7" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-semibold text-slate-900 text-xl leading-none tracking-tight">{column.title}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <p className="text-[11px] font-semibold text-[#7c3aed] tracking-tight">
                                                {formatCurrency(
                                                    claims.filter(c => c.status === column.id).reduce((sum, c) => sum + (c.expected_amount || 0), 0),
                                                    'GBP'
                                                )} Expected
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-auto w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xs font-semibold text-slate-900 border border-slate-200 font-mono ring-1 ring-slate-100">
                                        {claims.filter(c => c.status === column.id).length}
                                    </div>
                                </div>

                                {/* Task Container */}
                                <div className="flex-1 overflow-y-auto space-y-8 pr-2 premium-scrollbar pb-10 custom-scrollbar scroll-smooth">
                                    {claims.filter(c => c.status === column.id).map((claim: CommissionClaim) => (
                                        <CommissionCard
                                            key={claim.id}
                                            claim={claim}
                                        />
                                    ))}
                                    {claims.filter(c => c.status === column.id).length === 0 && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-40 grayscale opacity-10 group-hover/col:opacity-25 transition-all duration-200">
                                            <column.icon className="w-16 h-16 text-slate-400 mb-6" strokeWidth={1} />
                                            <p className="text-xs text-slate-500">No claims</p>
                                        </div>
                                    )}
                                </div>

                                <div className={`h-2 mx-16 rounded-full opacity-10 blur-[1px] group-hover:opacity-60 group-hover:blur-0 transition-all duration-700 ${column.accent}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.4',
                                filter: 'blur(4px)'
                            },
                        },
                    }),
                }}>
                    {activeId ? (
                        <CommissionCard claim={claims.find(c => c.id === activeId) as CommissionClaim} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

const CommissionCard = ({ claim, isOverlay }: { claim: CommissionClaim; isOverlay?: boolean }) => {
    const isRealized = claim.status === 'RECEIVED';

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div
            className={clsx(
                "bg-white p-6 rounded-2xl border transition-all duration-500 cursor-grab active:cursor-grabbing group relative overflow-hidden",
                isOverlay
                    ? "scale-105 border-[#7c3aed]/30 rotate-2 z-[100] ring-4 ring-[#7c3aed]/5"
                    : "border-slate-100 hover:border-[#7c3aed]/20 "
            )}
        >
            <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#7c3aed] opacity-60">Claim</span>
                    <span className="text-xs font-semibold text-slate-900 font-mono tracking-tight">#{claim.id.slice(0, 8).toUpperCase()}</span>
                </div>
                {isRealized && (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm animate-in zoom-in duration-200">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                )}
            </div>

            <div className="space-y-2 mb-8">
                <h4 className="font-semibold text-slate-900 text-2xl tracking-tight leading-none group-hover:text-[#7c3aed] transition-colors">
                    {claim.application_details?.student_name || 'Student'}
                </h4>
                <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-300" />
                    <p className="text-xs text-slate-500 font-bold tracking-tight truncate leading-none">
                        {claim.university_details?.name || 'Institutional Partner'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-slate-400">Amount</span>
                        <span className="text-xl font-semibold text-white">{formatCurrency(claim.expected_amount, claim.currency)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-400">Branch</span>
                        <span className="text-xs font-bold text-slate-600 tracking-tight">{claim.application_details?.course_name || 'Course not set'}</span>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
                <div
                    className={clsx(
                        "h-full transition-all duration-700",
                        claim.status === 'RECEIVED' ? "bg-emerald-500 w-full" :
                            claim.status === 'INVOICED' ? "bg-blue-500 w-2/3" :
                                "bg-[#7c3aed] w-1/3"
                    )}
                />
            </div>
        </div>
    );
};

export default CommissionKanban;
