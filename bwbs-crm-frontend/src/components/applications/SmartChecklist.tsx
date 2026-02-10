import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVisaRequirements } from '../../services/requirements';
import { createMagicLink } from '../../services/magicLinks';

interface SmartChecklistProps {
    studentId: string;
    destinationCountry: string;
    studentNationality: string;
}

const SmartChecklist = ({ studentId, destinationCountry, studentNationality }: SmartChecklistProps) => {
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
    const [magicLinkToast, setMagicLinkToast] = useState<string | null>(null);

    const { data: requirements, isLoading, isError } = useQuery({
        queryKey: ['visa-requirements', destinationCountry, studentNationality],
        queryFn: () => getVisaRequirements(destinationCountry, studentNationality),
        enabled: !!destinationCountry && !!studentNationality,
    });

    const handleFileUpload = (reqId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFiles(prev => ({
                ...prev,
                [reqId]: file
            }));
        }
    };

    const handleViewFile = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        // Clean up URL object after delay or on component unmount? 
        // For simplicity in this demo, letting browser handle garbage collection or user closing tab.
    };

    const handleMagicLinkRequest = async () => {
        if (!requirements) return;

        const pendingIds = requirements
            .filter(req => !uploadedFiles[req.id])
            .map(req => req.id);

        if (pendingIds.length === 0) return;

        try {
            const response = await createMagicLink(studentId, pendingIds);

            // Fix: Backend returns 'id' (UUID), not 'token'. Check all possible fields.
            // @ts-expect-error - Backend response type variations
            let token = response.id || response.token || response.link;

            // Safety check: If token is inside a full URL (e.g., http://.../uuid)
            if (typeof token === 'string' && token.includes('http')) {
                token = token.split('/').filter(Boolean).pop();
            }

            if (!token) {
                console.error("Token missing in response:", response);
                setMagicLinkToast('Error: Could not extract link token.');
                setTimeout(() => setMagicLinkToast(null), 3000);
                return;
            }

            // Construct correct Localhost URL
            const magicLinkUrl = `${window.location.origin}/magic-upload/${token}`;

            await navigator.clipboard.writeText(magicLinkUrl);
            setMagicLinkToast('Magic Link Copied! Send this to the student.');
            setTimeout(() => setMagicLinkToast(null), 3000);
        } catch (error) {
            console.error('Failed to create magic link:', error);
            setMagicLinkToast('Failed to generate link.');
            setTimeout(() => setMagicLinkToast(null), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 animate-pulse space-y-3">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-4 bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-700 rounded w-1/2" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                Failed to load visa requirements.
            </div>
        );
    }

    if (!requirements || requirements.length === 0) {
        return (
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                <p className="text-slate-400 text-sm">No specific requirements found for this route.</p>
            </div>
        );
    }

    const completedCount = Object.keys(uploadedFiles).length;
    const hasPending = requirements && completedCount < requirements.length;

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden relative">
            {/* Toast Notification */}
            {magicLinkToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-20 animate-fade-in-down">
                    {magicLinkToast}
                </div>
            )}

            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-6 4h6m-6 4h6M7 5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9l-4-4H7z" />
                        </svg>
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-white">Smart Visa Checklist</h3>
                        <p className="text-xs text-slate-400">
                            {studentNationality}
                            <span className="inline-flex items-center mx-1 text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-4-4m4 4l-4 4" />
                                </svg>
                            </span>
                            {destinationCountry}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-slate-500">
                        {completedCount} / {requirements.length} Completed
                    </div>
                    {hasPending && (
                        <button
                            onClick={handleMagicLinkRequest}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Request via Magic Link
                        </button>
                    )}
                </div>
            </div>

            <div className="divide-y divide-slate-700/50">
                {requirements.map((req) => {
                    const file = uploadedFiles[req.id];
                    const isChecked = !!file;

                    return (
                        <div
                            key={req.id}
                            className={`p-4 flex items-center gap-4 transition-colors ${isChecked ? 'bg-slate-800/30' : 'hover:bg-slate-700/20'}`}
                        >
                            {/* Checkbox State Indicator */}
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-600 bg-slate-800/50'
                                }`}>
                                {isChecked && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                    <span className={`text-sm font-medium ${isChecked ? 'text-slate-400' : 'text-white'}`}>
                                        {req.description || req.name}
                                    </span>
                                    {req.is_mandatory && (
                                        <span
                                            className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-red-400"
                                            title="Mandatory Requirement"
                                        />
                                    )}
                                    {req.origin_country && (
                                        <div className="group relative">
                                            <span className="cursor-help text-blue-400 leading-none">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                                                </svg>
                                            </span>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {req.notes || `Required for ${req.origin_country} citizens`}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isChecked && (
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        File: {file.name}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {isChecked ? (
                                    <button
                                        onClick={() => handleViewFile(file)}
                                        className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-white hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors"
                                    >
                                        View File
                                    </button>
                                ) : (
                                    <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Upload
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(req.id, e)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-slate-900/30 border-t border-slate-700/50 text-center">
                <p className="text-xs text-slate-500">
                    Please ensure all mandatory items are cleared before visa submission.
                </p>
            </div>
        </div>
    );
};

export default SmartChecklist;
