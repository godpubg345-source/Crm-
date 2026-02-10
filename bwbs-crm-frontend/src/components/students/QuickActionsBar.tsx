import { Phone, FileText, Calendar, Mail } from 'lucide-react';

interface QuickActionsBarProps {
    onLogCall: () => void;
    onAddNote: () => void;
    onAddTask: () => void;
    onSendEmail: () => void;
}

const QuickActionsBar = ({ onLogCall, onAddNote, onAddTask, onSendEmail }: QuickActionsBarProps) => {
    return (
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <ActionButton icon={<Phone className="w-4 h-4" />} label="Log Call" onClick={onLogCall} color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100" />
            <div className="w-px h-6 bg-slate-100" />
            <ActionButton icon={<FileText className="w-4 h-4" />} label="Note" onClick={onAddNote} color="text-blue-600 bg-blue-50 hover:bg-blue-100" />
            <div className="w-px h-6 bg-slate-100" />
            <ActionButton icon={<Calendar className="w-4 h-4" />} label="Task" onClick={onAddTask} color="text-amber-600 bg-amber-50 hover:bg-amber-100" />
            <div className="w-px h-6 bg-slate-100" />
            <ActionButton icon={<Mail className="w-4 h-4" />} label="Email" onClick={onSendEmail} color="text-indigo-600 bg-indigo-50 hover:bg-indigo-100" />
        </div>
    );
};

const ActionButton = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${color}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default QuickActionsBar;
