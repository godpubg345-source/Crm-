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
import { getVisaCases, updateVisaCase, type VisaCase, type VisaCaseUpdateData } from '../services/visa';
import {
    Loader2,
    Plane,
    FileCheck,
    CalendarCheck,
    AlertCircle,
    CheckCircle2,
    MapPin,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { VisaDetailModal } from '../components/visas/VisaDetailModal';
import clsx from 'clsx';

// ============================================================================
// VISA PORTAL - GLOBAL MOBILITY COMMAND CENTER
// ============================================================================

const COLUMNS = [
    { id: 'CAS_RECEIVED', title: 'CAS Received', icon: FileCheck, color: 'bg-slate-50 text-slate-400 border-slate-100', accent: 'bg-slate-400' },
    { id: 'DOCS_PREPARED', title: 'Docs Prepared', icon: ShieldCheck, color: 'bg-blue-50 text-blue-500 border-blue-100', accent: 'bg-blue-500' },
    { id: 'IHS_PAID', title: 'IHS Paid', icon: CalendarCheck, color: 'bg-indigo-50 text-indigo-500 border-indigo-100', accent: 'bg-indigo-500' },
    { id: 'VFS_SCHEDULED', title: 'VFS Scheduled', icon: MapPin, color: 'bg-[#AD03DE]/5 text-[#AD03DE] border-[#AD03DE]/10', accent: 'bg-[#AD03DE]' },
    { id: 'BIOMETRICS_DONE', title: 'Biometrics', icon: CheckCircle2, color: 'bg-cyan-50 text-cyan-500 border-cyan-100', accent: 'bg-cyan-500' },
    { id: 'VISA_SUBMITTED', title: 'Submitted', icon: Plane, color: 'bg-amber-50 text-amber-500 border-amber-100', accent: 'bg-amber-500' },
    { id: 'COLLECTION_READY', title: 'Passport Ready', icon: Briefcase, color: 'bg-teal-50 text-teal-500 border-teal-100', accent: 'bg-teal-500' },
    { id: 'DECISION_RECEIVED', title: 'Decision', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-500 border-emerald-100', accent: 'bg-emerald-500' },
    { id: 'APPEAL_SUBMITTED', title: 'Appeal', icon: AlertCircle, color: 'bg-rose-50 text-rose-500 border-rose-100', accent: 'bg-rose-500' },
];

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
    });
};

const VisaPortal = () => {
    const queryClient = useQueryClient();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedCase, setSelectedCase] = useState<VisaCase | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data: visaData, isLoading } = useQuery({
        queryKey: ['visa-cases'],
        queryFn: () => getVisaCases()
    });

    const cases = visaData?.results || [];

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateVisaCase(id, { status } as VisaCaseUpdateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visa-cases'] });
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

        const activeCase = cases.find(c => c.id === activeId);
        if (!activeCase) return;

        const overColumn = COLUMNS.find(col => col.id === overId);
        if (overColumn && activeCase.status !== overColumn.id) {
            statusMutation.mutate({ id: activeId, status: overColumn.id });
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#AD03DE]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Synchronizing Mobility Data</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden animate-in fade-in duration-1000 ease-out relative">
            {/* Ambient Background Blur for this page */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#AD03DE]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            {/* Command Header */}
            <div className="flex flex-col mb-12 px-1 relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-1.5 h-10 bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-900 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)]" />
                    <h1 className="text-6xl font-serif font-extrabold text-slate-900 tracking-tighter leading-none">Global Mobility Portal</h1>
                </div>
                <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.6em] ml-6 opacity-80">Strategic Visa Lifecycle Intelligence • Compliance Monitoring</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto pb-12 premium-scrollbar ps-1 pe-4 relative z-10">
                    <div className="flex gap-10 h-full min-w-max">
                        {COLUMNS.map(column => (
                            <div
                                id={column.id}
                                key={column.id}
                                className="w-[360px] flex flex-col bg-white/40 rounded-[3rem] p-6 border border-slate-100/80 backdrop-blur-3xl group/col hover:border-[#AD03DE]/10 transition-all duration-700 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]"
                            >
                                {/* Column Header */}
                                <div className="flex items-center gap-5 mb-8 px-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-700 group-hover/col:rotate-6 group-hover/col:shadow-[#AD03DE]/10 ${column.color}`}>
                                        <column.icon className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-serif font-extrabold text-slate-900 text-lg leading-none tracking-tight">{column.title}</h3>
                                        <p className="text-[8px] font-extrabold text-slate-600 uppercase tracking-widest mt-1.5 opacity-80">Dossier Progression</p>
                                    </div>
                                    <div className="ml-auto w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[10px] font-extrabold text-slate-900 shadow-xl border border-slate-50 font-mono ring-1 ring-slate-100">
                                        {cases.filter((c: VisaCase) => c.status === column.id).length}
                                    </div>
                                </div>

                                {/* Task Container */}
                                <div className="flex-1 overflow-y-auto space-y-6 pr-2 premium-scrollbar pb-10 custom-scrollbar scroll-smooth">
                                    {cases.filter((c: VisaCase) => c.status === column.id).map((visaCase: VisaCase) => (
                                        <VisaCard
                                            key={visaCase.id}
                                            visaCase={visaCase}
                                            onClick={() => { setSelectedCase(visaCase); setIsDetailOpen(true); }}
                                        />
                                    ))}
                                    {cases.filter((c: VisaCase) => c.status === column.id).length === 0 && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-32 grayscale opacity-10 group-hover/col:opacity-25 transition-all duration-1000">
                                            <column.icon className="w-14 h-14 text-slate-400 mb-4" strokeWidth={1} />
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Sector Synchronized</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Accent Stripe */}
                                <div className={`h-1.5 mx-12 rounded-full opacity-10 blur-[1px] group-hover:opacity-60 group-hover:blur-0 transition-all duration-700 ${column.accent}`} />
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
                        <VisaCard visaCase={cases.find(c => c.id === activeId) as VisaCase} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {selectedCase && (
                <VisaDetailModal
                    isOpen={isDetailOpen}
                    onClose={() => { setIsDetailOpen(false); setSelectedCase(null); }}
                    visaCase={selectedCase}
                />
            )}
        </div>
    );
};

// ============================================================================
// VISA CARD COMPONENT
// ============================================================================

const VisaCard = ({ visaCase, isOverlay, onClick }: { visaCase: VisaCase; isOverlay?: boolean; onClick?: () => void }) => {
    const studentName = visaCase.student_details?.full_name || 'Unknown Scholar';
    const isApproved = visaCase.decision_status === 'APPROVED';
    const isRejected = visaCase.decision_status === 'REJECTED';
    const isUrgent = visaCase.priority === 'URGENT';

    const statusSteps: VisaCase['status'][] = [
        'CAS_RECEIVED',
        'DOCS_PREPARED',
        'IHS_PAID',
        'VFS_SCHEDULED',
        'BIOMETRICS_DONE',
        'VISA_SUBMITTED',
        'ADDITIONAL_DOCS',
        'VISA_APPROVED',
        'PASSPORT_COLLECTED'
    ];

    const statusIndex = statusSteps.indexOf(visaCase.status);
    const baseProgress = statusIndex >= 0 ? Math.round(((statusIndex + 1) / statusSteps.length) * 100) : 0;
    const progressPercent = isApproved || isRejected ? 100 : baseProgress;

    return (
        <div
            onClick={onClick}
            className={clsx(
                "bg-white p-6 rounded-[2rem] border transition-all duration-500 cursor-grab active:cursor-grabbing group relative overflow-hidden",
                isOverlay
                    ? "shadow-[0_40px_80px_-16px_rgba(0,0,0,0.15)] scale-105 border-[#AD03DE]/30 rotate-2 z-[100] ring-4 ring-[#AD03DE]/5"
                    : "border-slate-100 hover:border-[#AD03DE]/20 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1"
            )}
        >
            {/* Visual indicator for decision status */}
            {isApproved && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />}
            {isRejected && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-colors" />}
            {isUrgent && <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mb-16 animate-pulse" />}

            <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-mono font-bold text-[#AD03DE] bg-[#AD03DE]/5 px-3 py-1.5 rounded-xl border border-[#AD03DE]/10 shadow-inner group-hover:bg-[#AD03DE] group-hover:text-white transition-all duration-500">
                    {visaCase.student_details?.student_code || 'STU-????'}
                </span>
                <div className="flex gap-2">
                    {isApproved && (
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 animate-in zoom-in duration-700">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    )}
                    {isRejected && (
                        <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 animate-in zoom-in duration-700">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    )}
                    {isUrgent && (
                        <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200 animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-1 mb-6">
                <h4 className="font-serif font-extrabold text-slate-900 text-xl tracking-tight leading-none group-hover:translate-x-1 transition-all">
                    {studentName}
                </h4>
                <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-300" />
                    <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest truncate">
                        {visaCase.vfs_location || 'Tactical Location Not Set'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] bg-slate-50/50 p-3 rounded-2xl border border-border group-hover:bg-white transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#AD03DE]">
                        <CalendarCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-serif font-extrabold text-[#AD03DE]">{visaCase.vfs_date ? formatDate(visaCase.vfs_date) : 'Deployment TBD'}</span>
                </div>

                {visaCase.ihs_reference && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-[9px] font-mono text-slate-400 truncate tracking-tighter font-bold">
                            {visaCase.ihs_reference}
                        </span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100/70">
                <div
                    className="h-full bg-gradient-to-r from-[#AD03DE] to-indigo-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

export default VisaPortal;
