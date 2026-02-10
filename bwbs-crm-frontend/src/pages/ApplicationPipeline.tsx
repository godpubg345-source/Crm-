import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type ApplicationStatus, type Application } from '../services/applications';
import {
    GraduationCap,
    Grab,
    Clock,
    ChevronRight,
    Layers,
    Target,
    type LucideIcon
} from 'lucide-react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

// ============================================================================
// APPLICATION PIPELINE - GLOBAL FLOW OPTIMIZATION
// ============================================================================

const COLUMNS: { id: string; title: string; statuses: ApplicationStatus[]; icon: LucideIcon; color: string }[] = [
    { id: 'prep', title: 'Preparation Stage', statuses: ['DRAFT', 'DOCUMENTS_READY'], icon: Clock, color: 'text-slate-400 bg-slate-50 border-slate-100' },
    { id: 'applied', title: 'Applied & Processing', statuses: ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'], icon: Target, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { id: 'offer', title: 'Institutional Offers', statuses: ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED', 'OFFER_DECLINED'], icon: GraduationCap, color: 'text-[#AD03DE] bg-[#AD03DE]/5 border-[#AD03DE]/10' },
    { id: 'compliance', title: 'Compliance & CAS', statuses: ['CAS_REQUESTED', 'CAS_RECEIVED'], icon: Layers, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
    { id: 'final', title: 'Enrolled & Archived', statuses: ['ENROLLED', 'REJECTED', 'WITHDRAWN'], icon: GraduationCap, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
];

// ============================================================================
// DRAGGABLE CARD COMPONENT
// ============================================================================
const DraggableCard = ({ app, isOverlay = false }: { app: Application; isOverlay?: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: app.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0.3 : 1,
        zIndex: isOverlay ? 1000 : undefined,
    };

    const isHighPriority = app.priority === 1;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                "group bg-white p-7 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex-shrink-0 cursor-grab active:cursor-grabbing",
                isOverlay
                    ? "shadow-[0_40px_80px_-16px_rgba(0,0,0,0.15)] border-[#AD03DE]/30 rotate-1 ring-4 ring-[#AD03DE]/5 scale-[1.02]"
                    : "border-slate-100/80 hover:border-[#AD03DE]/20 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] hover:-translate-y-1"
            )}
        >
            {/* Functional Accent Stripe */}
            <div className="absolute top-0 inset-x-12 h-1 bg-gradient-to-r from-transparent via-[#AD03DE]/10 to-transparent group-hover:via-[#AD03DE]/40 transition-all duration-700" />

            {isHighPriority && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
            )}

            <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:border-[#AD03DE]/10 group-hover:rotate-6 transition-all duration-500">
                    <GraduationCap className="w-7 h-7 text-slate-200 group-hover:text-[#AD03DE] transition-colors" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={clsx(
                        "px-3 py-1 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] border shadow-sm",
                        isHighPriority ? "bg-rose-50 text-rose-500 border-rose-100" :
                            app.priority === 2 ? "bg-amber-50 text-amber-500 border-amber-100" :
                                "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                        {app.priority === 1 ? 'Urgent Protocol' : app.priority === 2 ? 'Strategic' : 'Standard'}
                    </span>
                    <div className="px-2 py-1 bg-slate-50/50 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Grab className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-[9px] font-mono font-bold text-[#AD03DE] uppercase tracking-[0.3em] mb-1.5 opacity-60">
                        {app.application_ref || 'TR-PROT-PEND'}
                    </h4>
                    <h3 className="text-xl font-serif font-extrabold text-slate-900 tracking-tight mb-2 truncate group-hover:text-[#AD03DE] transition-colors leading-none">
                        {app.university_name_display || app.university?.name || 'Academic Institution'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-1">
                        {app.course_name_display || app.course?.name || 'Targeted Scholarly Course'}
                    </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[10px] font-serif font-extrabold font-bold text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                            {app.student_name || app.student?.name?.[0] || 'S'}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[140px] leading-none mb-1 group-hover:text-[#AD03DE] transition-colors">{app.student_name || app.student?.name || 'Unknown Scholar'}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registered Student</p>
                        </div>
                    </div>
                    <div className="p-2.5 bg-slate-50/50 hover:bg-[#AD03DE] rounded-xl transition-all duration-500 cursor-pointer group/arrow border border-transparent hover:shadow-lg active:scale-90">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// DROPPABLE COLUMN COMPONENT
// ============================================================================
const DroppableColumn = ({ col, children }: { col: typeof COLUMNS[0], children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useSortable({ id: col.id });

    return (
        <div ref={setNodeRef} className="w-[360px] flex-shrink-0 flex flex-col space-y-6">
            {/* Column Header */}
            <div className="flex items-center justify-between px-6 group/header">
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-700",
                        isOver ? "bg-[#AD03DE] text-white scale-110 shadow-lg shadow-[#AD03DE]/20" : col.color
                    )}>
                        <col.icon className="w-5 h-5" strokeWidth={isOver ? 2.5 : 2} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-base font-serif font-extrabold text-slate-900 tracking-tight leading-none">{col.title}</h3>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lifecycle Tracking</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center group-hover/header:border-[#AD03DE]/30 transition-colors">
                    <span className="text-[10px] font-mono font-bold text-slate-900">{React.Children.count(children)}</span>
                </div>
            </div>

            {/* Kanban Container */}
            <div className={clsx(
                "flex-1 rounded-[3rem] p-6 border border-dashed transition-all duration-700 overflow-y-auto premium-scrollbar flex flex-col space-y-6 min-h-[500px]",
                isOver
                    ? "bg-[#AD03DE]/5 border-[#AD03DE]/20 shadow-inner scale-[1.01]"
                    : "bg-slate-50/30 border-slate-200/50 hover:bg-slate-50/60 hover:border-slate-300"
            )}>
                {children}
                {React.Children.count(children) === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-24 grayscale opacity-10">
                        <Target className="w-12 h-12 text-slate-400 mb-4" />
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">No Active Dossiers</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PIPELINE BOARD COMPONENT
// ============================================================================
export const ApplicationPipelineBoard = ({
    applications,
    onStatusChange,
    onSelectApp
}: {
    applications: Application[];
    onStatusChange: (id: string, status: ApplicationStatus) => void;
    onSelectApp?: (id: string) => void;
}) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const onDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeApp = applications.find(a => a.id === active.id);
        const overId = over.id as string;

        let targetStatus: ApplicationStatus | null = null;
        const column = COLUMNS.find(c => c.id === overId);

        if (column) {
            targetStatus = column.statuses[0];
        } else {
            const overApp = applications.find(a => a.id === overId);
            if (overApp) targetStatus = overApp.status;
        }

        if (activeApp && targetStatus && activeApp.status !== targetStatus) {
            onStatusChange(activeApp.id, targetStatus);
        }
        setActiveId(null);
    };

    const activeApp = activeId ? applications.find(a => a.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex-1 flex gap-10 overflow-x-auto pb-12 custom-scrollbar scroll-smooth ps-1 pe-4">
                {COLUMNS.map((col) => {
                    const columnApps = applications.filter(a => col.statuses.includes(a.status));

                    return (
                        <DroppableColumn key={col.id} col={col}>
                            <SortableContext items={columnApps.map(a => a.id)} strategy={verticalListSortingStrategy}>
                                {columnApps.map((app) => (
                                    <div key={app.id} onClick={() => onSelectApp?.(app.id)}>
                                        <DraggableCard app={app} />
                                    </div>
                                ))}
                            </SortableContext>
                        </DroppableColumn>
                    );
                })}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: { opacity: '0.4', filter: 'blur(3px)' },
                    },
                }),
            }}>
                {activeApp ? (
                    <div className="w-[360px]">
                        <DraggableCard app={activeApp} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default ApplicationPipelineBoard;
