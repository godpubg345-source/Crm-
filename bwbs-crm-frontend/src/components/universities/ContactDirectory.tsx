import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, User, Mail, Phone, Linkedin,
    Star, Edit2, Trash2
} from 'lucide-react';
import { clsx } from 'clsx';

interface Contact {
    id: number;
    name: string;
    role: string;
    email: string;
    phone?: string;
    linkedin?: string;
    is_primary: boolean;
}

interface ContactDirectoryProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: Contact[];
    universityName: string;
    onAdd: (contact: Omit<Contact, 'id'>) => Promise<void>;
    onUpdate: (id: number, contact: Partial<Contact>) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onSetPrimary: (id: number) => Promise<void>;
}

const roleOptions = [
    'Admissions Officer',
    'International Manager',
    'Partnership Director',
    'Marketing Lead',
    'Registrar',
    'Other'
];

/**
 * Contact Directory for University Personnel Management
 */
export const ContactDirectory: React.FC<ContactDirectoryProps> = ({
    isOpen, onClose, contacts, universityName,
    onAdd, onUpdate, onDelete, onSetPrimary
}) => {
    const [isAddMode, setIsAddMode] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: 'Admissions Officer',
        email: '',
        phone: '',
        linkedin: '',
        is_primary: false
    });

    const resetForm = () => {
        setFormData({
            name: '',
            role: 'Admissions Officer',
            email: '',
            phone: '',
            linkedin: '',
            is_primary: false
        });
        setIsAddMode(false);
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) return;

        if (editingId) {
            await onUpdate(editingId, formData);
        } else {
            await onAdd(formData);
        }
        resetForm();
    };

    const startEdit = (contact: Contact) => {
        setFormData({
            name: contact.name,
            role: contact.role,
            email: contact.email,
            phone: contact.phone || '',
            linkedin: contact.linkedin || '',
            is_primary: contact.is_primary
        });
        setEditingId(contact.id);
        setIsAddMode(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ml-auto mr-8"
            >
                {/* Header */}
                <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#AD03DE]/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <User className="w-6 h-6 text-[#AD03DE]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">
                                    Contacts
                                </h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {universityName}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                <AnimatePresence>
                    {isAddMode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-b border-slate-100 overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="px-4 py-3 border border-slate-200 rounded-xl text-[11px] font-bold"
                                    />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="px-4 py-3 border border-slate-200 rounded-xl text-[11px] font-bold"
                                    >
                                        {roleOptions.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[11px] font-bold"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="px-4 py-3 border border-slate-200 rounded-xl text-[11px] font-bold"
                                    />
                                    <input
                                        type="url"
                                        placeholder="LinkedIn URL"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        className="px-4 py-3 border border-slate-200 rounded-xl text-[11px] font-bold"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_primary}
                                            onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                                            className="w-4 h-4 accent-[#AD03DE]"
                                        />
                                        <span className="text-[10px] font-bold text-slate-500">Set as Primary Contact</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={resetForm}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2 bg-[#AD03DE] text-white rounded-xl text-[10px] font-black uppercase"
                                        >
                                            {editingId ? 'Update' : 'Add Contact'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!isAddMode && (
                        <button
                            onClick={() => setIsAddMode(true)}
                            className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-[#AD03DE] hover:text-[#AD03DE] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Add New Contact</span>
                        </button>
                    )}

                    {contacts.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                No Contacts Added
                            </p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={clsx(
                                    "p-4 rounded-2xl border transition-all group",
                                    contact.is_primary
                                        ? "bg-[#AD03DE]/5 border-[#AD03DE]/20"
                                        : "bg-slate-50 border-transparent hover:bg-slate-100"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg font-black text-slate-400">
                                        {contact.name.split(' ').map(n => n[0]).join('')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900">{contact.name}</h4>
                                            {contact.is_primary && (
                                                <Star className="w-4 h-4 text-[#AD03DE] fill-[#AD03DE]" />
                                            )}
                                        </div>
                                        <p className="text-[9px] font-bold text-[#AD03DE] uppercase tracking-widest">
                                            {contact.role}
                                        </p>

                                        <div className="flex items-center gap-4 mt-3">
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-600"
                                            >
                                                <Mail className="w-3 h-3" />
                                                {contact.email}
                                            </a>
                                            {contact.phone && (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-600"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    {contact.phone}
                                                </a>
                                            )}
                                            {contact.linkedin && (
                                                <a
                                                    href={contact.linkedin}
                                                    target="_blank"
                                                    className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-blue-600"
                                                >
                                                    <Linkedin className="w-3 h-3" />
                                                    Profile
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {!contact.is_primary && (
                                            <button
                                                onClick={() => onSetPrimary(contact.id)}
                                                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                                                title="Set as Primary"
                                            >
                                                <Star className="w-3 h-3 text-slate-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startEdit(contact)}
                                            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                                        >
                                            <Edit2 className="w-3 h-3 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(contact.id)}
                                            className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3 text-rose-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};
