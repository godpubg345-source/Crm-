import React from 'react';
import clsx from 'clsx';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: any;
    label: string;
}

const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={clsx(
            "px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-700 group",
            active
                ? "bg-slate-900 text-white shadow-sm "
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        )}
    >
        <Icon className={clsx("w-4 h-4 transition-transform ", active ? "text-[#7c3aed]" : "text-slate-400")} />
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

export default TabButton;
