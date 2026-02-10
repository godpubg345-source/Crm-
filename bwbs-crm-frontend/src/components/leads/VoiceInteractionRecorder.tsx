import { useState, useRef } from 'react';

interface VoiceInteractionRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    onCancel: () => void;
}

const VoiceInteractionRecorder = ({ onRecordingComplete, onCancel }: VoiceInteractionRecorderProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);

            // Timer
            setDuration(0);
            timerRef.current = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            setError("Microphone access denied or not available.");
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`} />
                    <span className="text-sm font-bold font-mono text-white">
                        {isRecording ? formatDuration(duration) : '0:00'}
                    </span>
                    {error && <span className="text-[10px] text-rose-400 font-bold">{error}</span>}
                </div>

                <div className="flex items-center gap-2">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="w-10 h-10 rounded-full bg-[#AD03DE] hover:bg-[#9302bb] flex items-center justify-center text-white transition-all shadow-lg shadow-[#AD03DE]/30 active:scale-90"
                            title="Start Recording"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 1s-4 2-4 6v6s0 4 4 4 4-2 4-6V7s0-6-4-6zM19 10v1s0 7-7 7-7-7-7-7v-1m7 11v4m-4 0h8" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all shadow-lg shadow-rose-500/30 active:scale-95 animate-pulse"
                            title="Stop Recording"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all"
                        title="Cancel"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {isRecording && (
                <div className="mt-4 flex gap-1 items-end h-6 pb-1 px-4 overflow-hidden">
                    {[...Array(24)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-[#AD03DE] rounded-full transition-all duration-300"
                            style={{
                                height: `${Math.random() * 100}%`,
                                opacity: Math.max(0.2, Math.random())
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VoiceInteractionRecorder;
