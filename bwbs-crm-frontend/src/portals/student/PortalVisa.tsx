import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPortalMe } from '../../services/portal';
import {
    ShieldCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    Plane,
    MapPin,
    CreditCard,
    Building2,
    Zap
} from 'lucide-react';
import clsx from 'clsx';

const PortalVisa: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['portalMe'],
        queryFn: getPortalMe,
    });

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-48 bg-white rounded-[2.5rem]" />
                <div className="h-96 bg-white rounded-[2.5rem]" />
            </div>
        );
    }

    const visa_cases = data?.visa_cases ?? [];
    const activeVisa = visa_cases?.[0];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-purple-50 shadow-[0_20px_50px_rgba(173,3,222,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-900 font-serif">Visa Command Hub</h1>
                    <p className="text-slate-500 font-medium">Global mobility status & compliance tracking.</p>
                </div>
                {activeVisa && (
                    <div className="relative z-10 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Visa Status</p>
                            <p className="text-sm font-black">{activeVisa.status_display}</p>
                        </div>
                    </div>
                )}
            </div>

            {activeVisa ? (
                <div className="space-y-8">
                    {/* Progress Visualization */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-indigo-600" />
                                Journey Progress
                            </h2>
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <Zap className="w-4 h-4 text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Priority Processing</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-0 bottom-0 left-6 w-1 bg-slate-100 rounded-full" />
                            <div className="space-y-12 relative">
                                <Milestone
                                    completed={true}
                                    title="CAS Confirmation"
                                    date={new Date(activeVisa.created_at).toLocaleDateString()}
                                    description="University has issued your CAS document for visa application."
                                />
                                <Milestone
                                    completed={['IHS_PAID', 'FEE_PAID', 'DOCS_SUBMITTED', 'VISA_APPROVED'].includes(activeVisa.status)}
                                    current={activeVisa.status === 'CAS_RECEIVED'}
                                    title="Fee & IHS Payment"
                                    date={['IHS_PAID', 'FEE_PAID'].includes(activeVisa.status) ? "Confirmed" : "In Progress"}
                                    description="Payment of Immigration Health Surcharge and processing fees."
                                />
                                <Milestone
                                    completed={['DOCS_SUBMITTED', 'VISA_APPROVED'].includes(activeVisa.status)}
                                    current={['IHS_PAID', 'FEE_PAID'].includes(activeVisa.status)}
                                    title="VFS Appointment"
                                    date={activeVisa.status === 'DOCS_SUBMITTED' ? "Completed" : "Awaiting Schedule"}
                                    description="In-person biometrics and document submission at the center."
                                />
                                <Milestone
                                    completed={activeVisa.status === 'VISA_APPROVED'}
                                    current={activeVisa.status === 'DOCS_SUBMITTED'}
                                    title="Decision & Outcome"
                                    date={activeVisa.status === 'VISA_APPROVED' ? "Approved" : "Under Review"}
                                    description="Final decision on your entry clearance to the destination country."
                                    error={activeVisa.status === 'VISA_REJECTED'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-rose-500" />
                                Logistics Detail
                            </h3>
                            <div className="space-y-6">
                                <DetailItem label="Submission Center" value="VFS Global London" icon={Building2} />
                                <DetailItem label="Destination" value="United Kingdom" icon={Plane} />
                                <DetailItem label="Submission Type" value="Priority Service" icon={Zap} />
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-indigo-300">
                                <CreditCard className="w-5 h-5" />
                                IHS Confirmation
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Total Surcharge</p>
                                    <p className="text-2xl font-black mt-1">£2,340.00</p>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-200 text-xs font-medium">
                                    <Info className="w-4 h-4" />
                                    This payment is required before the VFS appointment.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                    <Plane className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h2 className="text-xl font-black text-slate-900">No active visa case</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">
                        Your visa file will be activated here once your CAS has been confirmed by the University and your document file is compliant.
                    </p>
                </div>
            )}

            {/* Support Widget */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">Need Visa Assistance?</h4>
                    <p className="text-xs text-slate-500 font-medium">Contact your dedicated compliance officer for priority support.</p>
                </div>
            </div>
        </div>
    );
};

const Milestone = ({ completed, current, title, date, description, error }: any) => (
    <div className="relative pl-14 group">
        <div className={clsx(
            "absolute left-0 top-1 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
            completed ? (error ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "bg-emerald-500 text-white shadow-lg shadow-emerald-100") :
                current ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 animate-pulse" :
                    "bg-white border-2 border-slate-200 text-slate-300"
        )}>
            {completed ? (error ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />) : <Clock className="w-6 h-6" />}
        </div>
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <h4 className={clsx(
                    "text-lg font-black tracking-tight leading-none",
                    completed ? "text-slate-900" : current ? "text-indigo-600" : "text-slate-400"
                )}>{title}</h4>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{date}</span>
            </div>
            <p className="text-sm text-slate-500 font-medium pr-10">{description}</p>
        </div>
    </div>
);

const DetailItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
);


export default PortalVisa;
