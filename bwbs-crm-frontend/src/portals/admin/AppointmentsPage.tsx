import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon, Clock, Users, Video, Phone, MapPin,
    Plus, Filter, Search, ChevronLeft, ChevronRight, MoreVertical,
    CheckCircle2, XCircle, AlertCircle, ExternalLink, Mail, MessageSquare
} from 'lucide-react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import appointmentService from '../../services/appointments';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const AppointmentsPage = () => {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [search, setSearch] = useState('');

    const { data: appointmentsResponse, isLoading } = useQuery({
        queryKey: ['appointments', search],
        queryFn: () => appointmentService.getAppointments({ search }),
    });

    const appointments = appointmentsResponse?.results || [];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-white/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded-md">
                            Scheduling
                        </div>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-medium text-slate-500">Student meetings</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                        Appointments
                    </h1>
                </div>

                <button className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all group hover:bg-violet-700">
                    <Plus className="w-4 h-4" />
                    New appointment
                </button>
            </motion.div>

            {/* Controls Row */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100/50 p-3 rounded-2xl border border-slate-200/50">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'calendar' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-slate-500'}`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? 'bg-[#7c3aed] text-white shadow-md' : 'text-slate-500'}`}
                        >
                            List
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-300 mx-2 hidden md:block" />

                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -30))} className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-slate-900 min-w-[120px] text-center">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student or counselor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
            </motion.div>

            {/* View Switching */}
            <AnimatePresence mode="wait">
                {view === 'calendar' ? (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-xl p-6 border border-slate-200 min-h-[600px]"
                    >
                        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden font-semibold text-xs text-slate-400 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-slate-50 py-4">{day}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-slate-100 border-x border-b border-slate-100 rounded-b-2xl overflow-hidden">
                            {/* Simple monthly grid logic */}
                            {[...Array(35)].map((_, i) => {
                                const day = addDays(monthStart, i - monthStart.getDay());
                                const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                                const isSelected = isToday(day);
                                const dayAppointments = appointments.filter(a => isSameDay(new Date(a.scheduled_start), day));

                                return (
                                    <div key={i} className={`min-h-[120px] bg-white p-3 flex flex-col gap-2 transition-colors hover:bg-slate-50/50 ${!isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold ${isSelected ? 'bg-[#7c3aed] text-white shadow-sm ' : 'text-slate-400'}`}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {dayAppointments.map((app, idx) => (
                                                <div key={idx} className="px-2 py-1 bg-indigo-50 border-l-2 border-indigo-500 rounded text-xs font-bold text-indigo-700 truncate cursor-pointer hover:bg-indigo-100 transition-colors">
                                                    {format(new Date(app.scheduled_start), 'HH:mm')} {app.student_details?.full_name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointment</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Counselor</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="px-8 py-5"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        appointments.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                                                            <span className="text-xs font-semibold text-[#7c3aed]">{format(new Date(app.scheduled_start), 'MMM')}</span>
                                                            <span className="text-sm font-semibold text-slate-900">{format(new Date(app.scheduled_start), 'dd')}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs font-semibold text-slate-900">
                                                                {format(new Date(app.scheduled_start), 'HH:mm')} - {format(new Date(app.scheduled_end), 'HH:mm')}
                                                            </span>
                                                            <span className="block text-xs text-slate-500 mt-0.5">{format(new Date(app.scheduled_start), 'EEEE')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900">{app.student_details?.full_name}</span>
                                                        <span className="text-xs font-semibold text-slate-400 tracking-tight">{app.student_details?.student_code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm font-medium text-slate-600">
                                                    {app.counselor_details?.first_name} {app.counselor_details?.last_name}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full w-fit">
                                                        {app.method === 'VIDEO' && <Video className="w-3.5 h-3.5 text-indigo-500" />}
                                                        {app.method === 'PHONE' && <Phone className="w-3.5 h-3.5 text-emerald-500" />}
                                                        {app.method === 'IN_PERSON' && <MapPin className="w-3.5 h-3.5 text-[#7c3aed]" />}
                                                        <span className="text-xs font-semibold text-slate-600">{app.method_display}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit ${app.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-600' :
                                                            app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                                app.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                                                                    'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {app.status === 'SCHEDULED' && <Clock className="w-3 h-3" />}
                                                        {app.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                                                        {app.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                                                        {app.status === 'NO_SHOW' && <AlertCircle className="w-3 h-3" />}
                                                        <span className="text-xs font-semibold">{app.status_display}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AppointmentsPage;
