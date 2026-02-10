import { useEffect, useState } from 'react';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    fileType: string; // 'application/pdf', 'image/jpeg', etc.
}

const FilePreviewModal = ({ isOpen, onClose, fileUrl, fileName, fileType }: FilePreviewModalProps) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
        }
    }, [isOpen, fileUrl]);

    if (!isOpen) return null;

    const isPdf = fileType.toLowerCase().includes('pdf') || fileName.toLowerCase().endsWith('.pdf');
    const isImage = fileType.toLowerCase().includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] shadow-2xl relative z-50 flex flex-col overflow-hidden animate-zoom-in">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#AD03DE]/5 flex items-center justify-center text-[#AD03DE]">
                            {isPdf ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 truncate max-w-md">{fileName}</h3>
                            <button
                                onClick={() => window.open(fileUrl, '_blank')}
                                className="text-xs font-medium text-[#AD03DE] hover:underline"
                            >
                                Open in New Tab
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            title="Download"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4v12" />
                            </svg>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content Viewer */}
                <div className="flex-1 bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50">
                            <div className="w-10 h-10 border-4 border-[#AD03DE]/30 border-t-[#AD03DE] rounded-full animate-spin" />
                        </div>
                    )}

                    {isPdf ? (
                        <iframe
                            src={`${fileUrl}#toolbar=0`}
                            className="w-full h-full rounded-xl shadow-sm bg-white"
                            onLoad={() => setIsLoading(false)}
                            title="PDF Preview"
                        />
                    ) : isImage ? (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                            onLoad={() => setIsLoading(false)}
                        />
                    ) : (
                        <div className="text-center p-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-slate-500 font-medium">Preview not available for this file type.</p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                className="inline-block mt-4 px-6 py-2 bg-[#AD03DE] text-white text-sm font-bold rounded-xl hover:bg-[#9302bb] transition-colors"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
