import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    X, Upload, FileText, Download, Trash2, Eye,
    FolderOpen, Check
} from 'lucide-react';
import { clsx } from 'clsx';

interface Document {
    id: number;
    title: string;
    document_type: string;
    file: string;
    uploaded_at: string;
}

interface DocumentVaultProps {
    isOpen: boolean;
    onClose: () => void;
    documents: Document[];
    universityName: string;
    onUpload: (file: File, title: string, type: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

const documentTypes = [
    { value: 'MOU', label: 'Memorandum of Understanding' },
    { value: 'AGREEMENT', label: 'Partnership Agreement' },
    { value: 'ACCREDITATION', label: 'Accreditation Certificate' },
    { value: 'BROCHURE', label: 'Course Brochure' },
    { value: 'OTHER', label: 'Other Document' },
];

const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        MOU: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        AGREEMENT: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        ACCREDITATION: 'bg-amber-50 text-amber-600 border-amber-100',
        BROCHURE: 'bg-pink-50 text-pink-600 border-pink-100',
        OTHER: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return colors[type] || colors.OTHER;
};

/**
 * Document Vault Manager for University Partnerships
 */
export const DocumentVault: React.FC<DocumentVaultProps> = ({
    isOpen, onClose, documents, universityName, onUpload, onDelete
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadType, setUploadType] = useState('MOU');
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleUpload = async () => {
        if (!uploadFile || !uploadTitle) return;

        setIsUploading(true);
        try {
            await onUpload(uploadFile, uploadTitle, uploadType);
            setUploadFile(null);
            setUploadTitle('');
            setUploadType('MOU');
        } finally {
            setIsUploading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-8 bg-slate-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#AD03DE]/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <FolderOpen className="w-6 h-6 text-[#AD03DE]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">
                                    Document Vault
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

                {/* Upload Zone */}
                <div className="p-8 border-b border-slate-100">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={clsx(
                            "border-2 border-dashed rounded-3xl p-8 text-center transition-all",
                            isDragging
                                ? "border-[#AD03DE] bg-[#AD03DE]/5"
                                : "border-slate-200 hover:border-slate-300",
                            uploadFile && "border-emerald-500 bg-emerald-50"
                        )}
                    >
                        {uploadFile ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                    <Check className="w-6 h-6 text-emerald-500" />
                                    <span className="text-sm font-black text-slate-900">{uploadFile.name}</span>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <input
                                        type="text"
                                        placeholder="Document Title"
                                        value={uploadTitle}
                                        onChange={(e) => setUploadTitle(e.target.value)}
                                        className="px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-bold w-48"
                                    />
                                    <select
                                        value={uploadType}
                                        onChange={(e) => setUploadType(e.target.value)}
                                        className="px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-bold"
                                    >
                                        {documentTypes.map(dt => (
                                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setUploadFile(null)}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload Document'}
                                        <Upload className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Drag & Drop Files Here
                                </p>
                                <p className="text-[9px] text-slate-300 mb-4">or</p>
                                <label className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-black transition-all inline-block">
                                    Browse Files
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.png,.jpg"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </>
                        )}
                    </div>
                </div>

                {/* Document List */}
                <div className="flex-1 overflow-y-auto p-8">
                    {documents.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                No Documents Uploaded
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <FileText className="w-6 h-6 text-slate-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 truncate">{doc.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={clsx(
                                                "text-[8px] font-black uppercase px-2 py-1 rounded-lg border",
                                                getTypeColor(doc.document_type)
                                            )}>
                                                {doc.document_type}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {formatDate(doc.uploaded_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <a
                                            href={doc.file}
                                            target="_blank"
                                            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                                        >
                                            <Eye className="w-4 h-4 text-slate-400" />
                                        </a>
                                        <a
                                            href={doc.file}
                                            download
                                            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                                        >
                                            <Download className="w-4 h-4 text-slate-400" />
                                        </a>
                                        <button
                                            onClick={() => onDelete(doc.id)}
                                            className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-rose-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
