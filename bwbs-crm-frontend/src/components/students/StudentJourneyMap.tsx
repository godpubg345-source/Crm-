import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export type JourneyStage = 'LEAD' | 'PROFILE_READY' | 'APPLIED' | 'OFFER_RECEIVED' | 'VISA_FILING' | 'ENROLLED';

interface StudentJourneyMapProps {
    currentStage: JourneyStage;
    onStageClick?: (stage: JourneyStage) => void;
}

const stages: { id: JourneyStage; label: string; description: string }[] = [
    { id: 'LEAD', label: 'Lead', description: 'Account Created' },
    { id: 'PROFILE_READY', label: 'Profile', description: '100% Complete' },
    { id: 'APPLIED', label: 'Applied', description: 'Apps Submitted' },
    { id: 'OFFER_RECEIVED', label: 'Offers', description: 'Offer Secured' },
    { id: 'VISA_FILING', label: 'Visa', description: 'CAS & Filing' },
    { id: 'ENROLLED', label: 'Enrolled', description: 'Journey Complete' },
];

const StudentJourneyMap = ({ currentStage, onStageClick }: StudentJourneyMapProps) => {
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    return (
        <div className="w-full py-2 overflow-x-auto pb-6 premium-scrollbar">
            <div className="flex items-center justify-between relative min-w-[800px] px-8">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-100 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute top-1/2 left-8 h-1.5 bg-gradient-to-r from-indigo-500 via-[#AD03DE] to-fuchsia-500 rounded-full -z-10 shadow-[0_0_15px_rgba(173,3,222,0.4)]"
                />

                {stages.map((stage, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <div
                            key={stage.id}
                            className={`flex flex-col items-center gap-3 relative group cursor-pointer ${isPending ? 'opacity-50 hover:opacity-100' : ''}`}
                            onClick={() => onStageClick && onStageClick(stage.id)}
                        >
                            {/* Step Indicator */}
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    backgroundColor: isActive ? '#fff' : isCompleted ? '#AD03DE' : '#f1f5f9',
                                    borderColor: isActive ? '#AD03DE' : isCompleted ? '#AD03DE' : '#e2e8f0'
                                }}
                                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 shadow-sm transition-all duration-300 relative
                                    ${isActive ? 'shadow-[0_0_20px_rgba(173,3,222,0.4)]' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : isActive ? (
                                    <div className="w-3 h-3 rounded-full bg-[#AD03DE] animate-pulse" />
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                                )}

                                {/* Pulse Effect for Active */}
                                {isActive && (
                                    <span className="absolute inset-0 rounded-full bg-[#AD03DE] opacity-20 animate-ping" />
                                )}
                            </motion.div>

                            {/* Label & Description */}
                            <div className="text-center space-y-0.5">
                                <p className={`text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-[#AD03DE]' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {stage.label}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400">
                                    {stage.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentJourneyMap;
