import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDocuments,
    uploadDocument,
    deleteDocument,
    type Document,
    type DocumentCategory,
    categoryLabels,
    categoryOptions
} from '../../services/documents';
import FilePreviewModal from '../common/FilePreviewModal';

// ============================================================================
// DOCUMENTS TAB COMPONENT - Education Consultancy ERP
// ============================================================================

interface DocumentsTabProps {
    studentId: string;
}

const statusColors: Record<Document['verification_status'], string> = {
    PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
    IN_REVIEW: 'bg-blue-50 text-blue-600 border-blue-100',
    VERIFIED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
};

// Helper to ensure file URLs are absolute
const getFileUrl = (path: string) => {
    if (!path) return '#';
    if (path.startsWith('http')) return path; // Already full URL
    return `http://127.0.0.1:8000${path}`; // Append Backend Base URL
};

const categoryBadges: Partial<Record<DocumentCategory, { label: string; className: string }>> = {
    PASSPORT: { label: 'PASS', className: 'bg-blue-50 text-blue-600 border-blue-100' },
    NATIONAL_ID: { label: 'ID', className: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    TRANSCRIPT: { label: 'TRNS', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    CERTIFICATE: { label: 'CERT', className: 'bg-purple-50 text-purple-600 border-purple-100' },
    ENGLISH_TEST: { label: 'TEST', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    BANK_STATEMENT: { label: 'BANK', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    SPONSOR_LETTER: { label: 'SPON', className: 'bg-orange-50 text-orange-600 border-orange-100' },
    SOP: { label: 'SOP', className: 'bg-sky-50 text-sky-600 border-sky-100' },
    CV: { label: 'CV', className: 'bg-slate-50 text-slate-600 border-slate-100' },
    REFERENCE: { label: 'REF', className: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    OFFER_LETTER: { label: 'OFR', className: 'bg-rose-50 text-rose-600 border-rose-100' },
    CAS: { label: 'CAS', className: 'bg-violet-50 text-violet-600 border-violet-100' },
    VISA: { label: 'VISA', className: 'bg-pink-50 text-pink-600 border-pink-100' },
    OTHER: { label: 'DOC', className: 'bg-slate-50 text-slate-600 border-slate-100' },
};

const getCategoryIcon = (category: DocumentCategory) => {
    const badge = categoryBadges[category] || { label: 'DOC', className: 'bg-slate-50 text-slate-600 border-slate-100' };
    return (
        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border text-[11px] font-bold ${badge.className}`}>
            {badge.label}
        </span>
    );
};

const DocumentsTab = ({ studentId }: DocumentsTabProps) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('PASSPORT');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal State
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['documents', studentId],
        queryFn: () => getDocuments(studentId),
    });

    const uploadMutation = useMutation({
        mutationFn: uploadDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', studentId] });
            setIsUploadOpen(false);
            setSelectedFile(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', studentId] });
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            uploadMutation.mutate({
                student: studentId,
                category: selectedCategory,
                document_type: categoryLabels[selectedCategory], // Use label as type
                file: selectedFile,
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-border" />
                ))}
            </div>
        );
    }

    // Error State
    if (isError) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">Failed to load documents</p>
            </div>
        );
    }

    const documents = data?.results || [];

    return (
        <div className="space-y-8">
            {/* Header with Upload Button */}
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 pl-2">
                    {documents.length} document{documents.length !== 1 ? 's' : ''}
                </p>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7c3aed] hover:bg-[#9302bb] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                </button>
            </div>

            {/* Upload Form (Expanded) */}
            {isUploadOpen && (
                <div className="bg-white rounded-xl p-6 border border-[#7c3aed]/20 space-y-8 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Upload document</h4>
                            <p className="text-xs text-slate-400 font-medium">Add a document to this student's file</p>
                        </div>
                        <button
                            onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-slate-500 mb-3 ml-1">Document type</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 focus:border-[#7c3aed] transition-all"
                                >
                                    {categoryOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button
                                    onClick={() => { setIsUploadOpen(false); setSelectedFile(null); }}
                                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploadMutation.isPending}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-[#9302bb] text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {uploadMutation.isPending ? 'Syncing...' : 'Secure Asset'}
                                </button>
                            </div>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-100 rounded-2xl p-6 text-center cursor-pointer hover:border-[#7c3aed]/30 hover:bg-[#7c3aed]/5 transition-all group/dropzone bg-slate-50/50"
                        >
                            {selectedFile ? (
                                <div className="space-y-4 py-4 translate-y-2">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mx-auto border border-emerald-100 text-emerald-500 shadow-sm animate-in zoom-in-75">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900 truncate px-4">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)} ready</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto border border-slate-200 text-slate-300 group-hover/dropzone:text-[#7c3aed] transition-all duration-200">
                                        <svg className="w-8 h-8 font-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900">Select type</p>
                                        <p className="text-xs text-slate-500 tracking-tight">Drag & Drop Documents Here</p>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium">TIFF, PDF, JPEG, PNG • Up to 25MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Documents Grid */}
            {documents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-6 border border-slate-200 text-slate-200">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 mb-2">No documents yet</h3>
                    <p className="text-xs text-slate-400 font-medium">Upload this student's passport, transcripts and other documents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white rounded-xl p-6 border border-border hover:border-[#7c3aed]/40 transition-all duration-200 group cursor-default relative overflow-hidden"
                        >

                            <div className="flex items-start gap-5 relative z-10">
                                <div className="transition-all duration-200">
                                    {getCategoryIcon(doc.category)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font- serif font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors truncate pr-8"> {doc.document_type}</p>
                                    <p className="text-xs text-slate-500 tracking-tight truncate mt-0.5">{doc.file_name}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold shadow-sm transition-all ${statusColors[doc.verification_status]}`}>
                                            {doc.verification_status}
                                        </span>
                                        <span className="text-xs font-bold text-slate-300 tracking-tight">{formatFileSize(doc.file_size)} INDUCTED</span>
                                    </div>
                                </div>
                                <div className="absolute -top-1 -right-1 flex items-center">
                                    <button
                                        onClick={() => setPreviewFile({
                                            url: getFileUrl(doc.file),
                                            name: doc.file_name,
                                            type: doc.file_name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' // Basic type inference
                                        })}
                                        className="p-2 text-slate-300 hover:text-[#7c3aed] hover:bg-[#7c3aed]/5 rounded-xl transition-all"
                                        title="Preview"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    <a
                                        href={getFileUrl(doc.file)}
                                        download={doc.file_name}
                                        className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                        title="Download"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4v12" />
                                        </svg>
                                    </a>
                                    <button
                                        onClick={() => deleteMutation.mutate(doc.id)}
                                        disabled={deleteMutation.isPending}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Delete"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileUrl={previewFile.url}
                    fileName={previewFile.name}
                    fileType={previewFile.type}
                />
            )}
        </div>
    );
};

export default DocumentsTab;
