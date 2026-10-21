import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPortalMe, uploadPortalDocument } from '../../services/portal';
import type { PortalDocument } from '../../services/portal';
import {
    FileText,
    Upload,
    Download,
    Search,
    Plus,
    Loader2,
    FolderOpen,
    CheckCircle2,
    AlertCircle,
    Target,
    ShieldAlert,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const PortalDocuments: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
    });

    const uploadMutation = useMutation({
        mutationFn: uploadPortalDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalMe'] });
            setIsUploading(false);
        },
        onError: () => {
            setIsUploading(false);
        }
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-64 bg-white rounded-[2.5rem]" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const documents = data?.documents ?? [];

    // Checklist Logic
    const requiredDocs = [
        { type: 'PASSPORT', label: 'Passport Carry Copy', description: 'Clear scan of bio-data page' },
        { type: 'TRANSCRIPT', label: 'Academic Transcripts', description: 'Consolidated or semester-wise' },
        { type: 'CV', label: 'Modern CV/Resume', description: 'Updated with latest experience' },
        { type: 'IELTS', label: 'English Proficiency', description: 'IELTS/PTE/TOEFL report' },
    ];

    const uploadedTypes = new Set(documents.map((d: any) => d.document_type));
    const missingDocs = requiredDocs.filter(doc => !uploadedTypes.has(doc.type));
    const complianceRate = Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100);

    const filteredDocs = documents.filter((doc: PortalDocument) =>
        doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.status_display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type_display?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_type', 'OTHER'); // Specific type
            formData.append('category', 'OTHER');      // Model category (REQUIRED)
            uploadMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 font-serif">Document Vault</h1>
                    <p className="text-slate-500 font-medium">Your secure storage for all academic and identity files.</p>
                </div>

                <div className="relative">
                    <input
                        type="file"
                        id="portal-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="portal-upload"
                        className="h-14 bg-slate-900 text-white rounded-2xl px-8 font-black text-sm flex items-center justify-center gap-3 hover:bg-purple-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {isUploading ? 'Uploading...' : 'Upload New File'}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <section className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm self-start">
                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-5 top-4 w-5 h-5 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search your documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 text-sm font-bold focus:border-purple-200 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    {/* Documents Table/List */}
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredDocs.length > 0 ? filteredDocs.map((doc: PortalDocument) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group p-5 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-sm truncate max-w-[200px]">{doc.file_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                                        {doc.document_type_display}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300 font-bold tracking-tighter">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5",
                                                doc.is_verified ? "text-emerald-600 bg-emerald-50" :
                                                    doc.status === 'rejected' ? "text-rose-600 bg-rose-50" :
                                                        "text-amber-600 bg-amber-50"
                                            )}>
                                                {doc.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                {doc.status_display}
                                            </div>
                                            <a
                                                href={doc.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:shadow-lg rounded-xl transition-all border border-slate-100"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </div>

                                    {doc.status === 'rejected' && (
                                        <div className="mt-4 p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-3">
                                            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Compliance Feedback</p>
                                                <p className="text-xs text-rose-500 font-medium">
                                                    The document layout is blurred or truncated. Please re-scan in high resolution with all 4 corners visible.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FolderOpen className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">No documents found</h3>
                                    <p className="text-slate-400 font-medium">Try searching for something else or upload a new file.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Checklist Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-400" />
                                Requirements
                            </h3>
                            <span className="text-sm font-black text-indigo-400">{complianceRate}%</span>
                        </div>

                        <div className="space-y-6">
                            {requiredDocs.map((doc, i) => {
                                const isUploaded = uploadedTypes.has(doc.type);
                                return (
                                    <div key={i} className="flex gap-4">
                                        <div className={clsx(
                                            "w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-colors",
                                            isUploaded ? "bg-emerald-500 text-white" : "bg-white/10 text-white/20"
                                        )}>
                                            {isUploaded ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                                        </div>
                                        <div>
                                            <h4 className={clsx(
                                                "text-sm font-bold leading-none mb-1",
                                                isUploaded ? "text-white" : "text-white/60"
                                            )}>{doc.label}</h4>
                                            <p className="text-[10px] text-white/40 font-medium">{doc.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <Info className="w-5 h-5 text-indigo-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Vault Tip</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                                High-quality PDF/JPG scans increase your compliance score and speed up university admission processing.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            Compliance Help
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                            If you're unsure about document formats or requirements, our compliance team is here to help.
                        </p>
                        <button className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
                            Support Guidelines
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Upload className="w-8 h-8 text-indigo-300" />
                </div>
                <div>
                    <h3 className="text-xl font-black mb-2 tracking-tight">Need to submit something else?</h3>
                    <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                        Upload your transcripts, experience letters, or any other relevant documents here.
                        Our document processors will verify them within 24-48 working hours.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalDocuments;
