import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '../services/students';

// ============================================================================
// ADD STUDENT MODAL - BWBS Education CRM
// ============================================================================

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    passport_number: string;
    date_of_birth: string;
}

const initialFormData: FormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    passport_number: '',
    date_of_birth: '',
};

const AddStudentModal = ({ isOpen, onClose }: AddStudentModalProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const mutation = useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            // Refresh the students list
            queryClient.invalidateQueries({ queryKey: ['students'] });
            // Reset form and close modal
            setFormData(initialFormData);
            setErrors({});
            onClose();
        },
    });

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.passport_number.trim()) newErrors.passport_number = 'Passport number is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validate()) {
            mutation.mutate(formData);
        }
    };

    const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-lg transform rounded-2xl bg-white border border-border shadow-2xl transition-all animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-slate-900 font-serif">Add New Student</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Error Banner */}
                        {mutation.isError && (
                            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {(mutation.error as Error)?.message || 'Failed to create student. Please try again.'}
                            </div>
                        )}

                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange('first_name')}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm ${errors.first_name ? 'border-red-500' : 'border-border'
                                        }`}
                                    placeholder="John"
                                />
                                {errors.first_name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange('last_name')}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm ${errors.last_name ? 'border-red-500' : 'border-border'
                                        }`}
                                    placeholder="Doe"
                                />
                                {errors.last_name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                className={`w-full px-4 py-2.5 rounded-lg bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm ${errors.email ? 'border-red-500' : 'border-border'
                                    }`}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        {/* Phone & DOB Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange('phone')}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm"
                                    placeholder="+44 7XXX XXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={handleChange('date_of_birth')}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-border text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Passport Number */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Passport Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.passport_number}
                                onChange={handleChange('passport_number')}
                                className={`w-full px-4 py-2.5 rounded-lg bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#AD03DE]/30 focus:border-[#AD03DE] transition-all shadow-sm font-mono ${errors.passport_number ? 'border-red-500' : 'border-border'
                                    }`}
                                placeholder="AB1234567"
                            />
                            {errors.passport_number && <p className="mt-1 text-xs text-red-500 font-medium">{errors.passport_number}</p>}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-border rounded-lg transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#AD03DE] hover:bg-[#9302bb] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#AD03DE]/20 active:scale-95"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Student'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
