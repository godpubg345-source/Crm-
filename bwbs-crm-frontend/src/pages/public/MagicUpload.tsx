import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { validateToken, uploadFileViaMagicLink, type MagicLinkValidationResponse } from '../../services/magicLinks';

const MagicUpload = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Explicit State Variables
    const [studentName, setStudentName] = useState<string>('');
    const [agencyName, setAgencyName] = useState<string>('BWBS Education');
    const [requirements, setRequirements] = useState<MagicLinkValidationResponse['requirements']>([]);

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchLink = async () => {
            if (!token) return;
            try {
                const data = await validateToken(token);

                // Map strictly to backend keys
                setStudentName(data.student_name);
                if (data.agency_name) setAgencyName(data.agency_name);
                setRequirements(data.requirements);

                // Initialize completed items
                if (data.requirements) {
                    const completed = data.requirements.reduce((acc, req) => {
                        if (req.is_completed) acc[req.id] = true;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setCompletedItems(completed);
                }
                setLoading(false);
            } catch {
                setError('This link is invalid or has expired.');
                setLoading(false);
            }
        };
        fetchLink();
    }, [token]);

    const handleFileUpload = async (reqId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !token) return;

        setUploading(prev => ({ ...prev, [reqId]: true }));
        try {
            await uploadFileViaMagicLink(token, file, reqId);
            setCompletedItems(prev => ({ ...prev, [reqId]: true }));
        } catch {
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [reqId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-3xl">
                        ❌
                    </div>
                    <h1 className="text-xl font-bold text-white">Invalid or Expired Link</h1>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    const allCompleted = requirements.length > 0 && requirements.every(req => completedItems[req.id]);

    if (allCompleted) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-6 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">
                        ✅
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Thank You, {studentName}!</h1>
                        <p className="text-slate-400">
                            All requested documents have been successfully uploaded. We will review them shortly.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm text-slate-500">You can close this window now.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg text-2xl mb-4">
                        📄
                    </div>
                    <h2 className="text-3xl font-bold text-white">Document Request</h2>
                    <p className="text-slate-400">
                        Hello <span className="text-white font-medium">{studentName}</span>, please upload the following documents for <span className="text-blue-400">{agencyName}</span>.
                    </p>
                </div>

                {/* List */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="divide-y divide-slate-700/50">
                        {requirements.map((req) => {
                            const isDone = completedItems[req.id];
                            const isUploading = uploading[req.id];

                            return (
                                <div key={req.id} className={`p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${isDone ? 'bg-slate-800/80' : 'hover:bg-slate-700/30'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDone ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {isDone ? '✓' : '📄'}
                                            </div>
                                            <h3 className={`font-medium ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                {req.description}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Action & Status */}
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:block">
                                            {isDone ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                                    ✅ Uploaded
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                                                    🟡 Pending
                                                </span>
                                            )}
                                        </div>

                                        {isDone ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <label className={`
                                                relative cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                                                text-sm font-medium transition-all shadow-lg
                                                ${isUploading
                                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 active:scale-95'}
                                            `}>
                                                {isUploading ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Uploading...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Upload / Photo
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    disabled={isUploading}
                                                    onChange={(e) => handleFileUpload(req.id, e)}
                                                    accept="image/*,application/pdf"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center text-slate-500 text-sm">
                    <p>Secured by BWBS Magic Link Technology</p>
                </div>
            </div>
        </div>
    );
};

export default MagicUpload;
