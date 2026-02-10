import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCounselorAvailability, createLeadInteraction } from '../../services/leads';

const Booking = () => {
    const { counselorId } = useParams<{ counselorId: string }>();
    const [searchParams] = useSearchParams();
    const leadId = searchParams.get('leadId');

    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBooked, setIsBooked] = useState(false);

    const { data: availability = [], isLoading } = useQuery({
        queryKey: ['availability', counselorId],
        queryFn: getCounselorAvailability,
    });

    const bookingMutation = useMutation({
        mutationFn: async (slot: any) => {
            if (!leadId) return;
            // Create a meeting interaction
            return createLeadInteraction({
                lead: leadId,
                type: 'MEETING',
                content: `Meeting scheduled for ${slot.day_name} at ${slot.start_time}`,
            });
        },
        onSuccess: () => {
            setIsBooked(true);
        },
    });

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#AD03DE] border-t-transparent" />
        </div>
    );

    if (isBooked) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">Success!</h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                    Your session has been reserved. You will receive a confirmation email shortly with the meeting link.
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-900 p-12 text-center">
                        <h1 className="text-4xl font-serif font-bold text-white mb-2">Book Your Vision</h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Schedule a session with your Counselor</p>
                    </div>

                    <div className="p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availability.map((slot) => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left group ${selectedSlot === slot.id
                                        ? 'border-[#AD03DE] bg-[#AD03DE]/5 shadow-lg shadow-[#AD03DE]/10'
                                        : 'border-slate-50 hover:border-slate-200 bg-white'
                                        }`}
                                >
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#AD03DE] transition-colors">
                                        {slot.day_name}
                                    </div>
                                    <div className="text-lg font-bold text-slate-900">
                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedSlot && (
                            <div className="mt-12">
                                <button
                                    onClick={() => {
                                        const slot = availability.find(s => s.id === selectedSlot);
                                        bookingMutation.mutate(slot);
                                    }}
                                    disabled={bookingMutation.isPending}
                                    className="w-full py-5 bg-[#AD03DE] hover:bg-[#9302bb] text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-[#AD03DE]/20 active:scale-95 disabled:opacity-50"
                                >
                                    {bookingMutation.isPending ? 'Confirming...' : 'Secure My Appointment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    BWBS Education &bull; Global Academic Excellence
                </p>
            </div>
        </div>
    );
};

export default Booking;
