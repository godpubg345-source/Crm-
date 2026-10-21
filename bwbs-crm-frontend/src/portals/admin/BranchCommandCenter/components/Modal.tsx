import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h4 className="text-2xl font-semibold text-slate-900">{title}</h4>
                        <div className="w-12 h-1 bg-[#7c3aed] mt-2 rounded-full" />
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
