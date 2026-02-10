import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, type AuditLog } from '../../services/auditLogs';
import { getStudentCommunications, type CommunicationLog } from '../../services/communications';
import {
    Clock,
    MessageSquare,
    Phone,
    Mail,
    FileText,
    UserPlus,
    Edit,
    Trash2,
    Calendar,
    GraduationCap,
    Stamp,
    MessageCircle
} from 'lucide-react';

interface ActivityFeedProps {
    studentId: string;
}

interface UnifiedActivity {
    id: string;
    type: 'AUDIT' | 'COMMUNICATION';
    title: string;
    subtitle: string;
    description: string;
    timestamp: string;
    icon: any;
    color: string;
    metadata?: any;
}

const ActivityFeed = ({ studentId }: ActivityFeedProps) => {
    // 1. Fetch Audit Logs for this student
    const { data: auditData, isLoading: auditLoading } = useQuery({
        queryKey: ['audit-logs', studentId],
        queryFn: () => getAuditLogs({ search: studentId, ordering: '-created_at' }),
    });

    // 2. Fetch Communication Logs for this student
    const { data: commsData, isLoading: commsLoading } = useQuery({
        queryKey: ['student-communications', studentId],
        queryFn: () => getStudentCommunications(studentId),
    });

    const isLoading = auditLoading || commsLoading;

    // 3. Merge and Sort
    const auditActivities: UnifiedActivity[] = (auditData?.results || []).map((log: AuditLog) => {
        let title = 'System Activity';
        let icon = FileText;
        let color = 'text-slate-400';
        let description = `${log.actor_details?.first_name || 'System'} performed ${log.action.toLowerCase()} on ${log.model}`;

        if (log.action === 'CREATE') {
            title = 'Record Created';
            icon = UserPlus;
            color = 'text-emerald-500';
        } else if (log.action === 'UPDATE') {
            title = 'Information Updated';
            icon = Edit;
            color = 'text-blue-500';

            // Check for specific field changes to make it more descriptive
            if (log.changes) {
                const fields = Object.keys(log.changes);
                if (fields.length > 0) {
                    description = `${log.actor_details?.first_name || 'System'} updated: ${fields.join(', ')}`;
                }
            }
        } else if (log.action === 'DELETE') {
            title = 'Record Deleted';
            icon = Trash2;
            color = 'text-red-500';
        }

        // Custom mapping for models
        if (log.model === 'Application') {
            icon = GraduationCap;
            color = 'text-[#AD03DE]';
        } else if (log.model === 'VisaCase') {
            icon = Stamp;
            color = 'text-orange-500';
        }

        return {
            id: log.id,
            type: 'AUDIT',
            title,
            subtitle: log.model,
            description,
            timestamp: log.created_at,
            icon,
            color,
            metadata: log.changes
        };
    });

    const commActivities: UnifiedActivity[] = (commsData?.results || []).map((log: CommunicationLog) => {
        let icon = MessageSquare;
        let color = 'text-blue-500';

        if (log.communication_type === 'CALL') {
            icon = Phone;
            color = 'text-emerald-500';
        } else if (log.communication_type === 'EMAIL') {
            icon = Mail;
            color = 'text-amber-500';
        } else if (log.communication_type === 'WHATSAPP') {
            icon = MessageCircle;
            color = 'text-emerald-600';
        } else if (log.communication_type === 'SMS') {
            icon = MessageSquare;
            color = 'text-slate-500';
        } else if (log.communication_type === 'MEETING') {
            icon = Calendar;
            color = 'text-[#AD03DE]';
        }

        return {
            id: log.id,
            type: 'COMMUNICATION',
            title: log.communication_type_display || log.communication_type,
            subtitle: log.direction_display || log.direction,
            description: log.summary,
            timestamp: log.created_at,
            icon,
            color,
            metadata: { logged_by: log.logged_by_details?.first_name }
        };
    });

    const allActivities = [...auditActivities, ...commActivities].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-400 animate-pulse">Synchronizing activity streams...</p>
            </div>
        );
    }

    if (allActivities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No activity logged yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Important events and communications will appear here.</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-100" />

            <div className="space-y-8 relative">
                {allActivities.map((activity, idx) => (
                    <div key={activity.id} className="flex gap-6 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        {/* Icon Node */}
                        <div className={`relative z-10 w-12 h-12 flex-shrink-0 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center ${activity.color}`}>
                            <activity.icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5 pb-2">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activity.subtitle}</span>
                                <span className="text-[10px] font-bold text-slate-400">{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{activity.title}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {activity.description}
                            </p>

                            {/* Metadata visualization */}
                            {activity.type === 'COMMUNICATION' && activity.metadata?.logged_by && (
                                <div className="mt-2 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="text-[10px] text-slate-400 font-medium">Logged by {activity.metadata.logged_by}</span>
                                </div>
                            )}

                            {activity.type === 'AUDIT' && activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <div className="mt-2 p-2 bg-slate-50/50 rounded-lg border border-slate-100 inline-block">
                                    <span className="text-[9px] font-mono text-slate-400 lowercase">
                                        payload sync: {Object.keys(activity.metadata).length} attributes
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Status Indicator */}
                <div className="flex items-center gap-2 pl-12 py-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Live Stream Active</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
