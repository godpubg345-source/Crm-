import { useQuery } from '@tanstack/react-query';
import { getVisaCases } from '../../services/visa';
import {
    ShieldCheck,
    TrendingUp,
    AlertCircle,
    Clock,
    Globe,
    Briefcase,
    Calendar,
    Users,
    MapPin
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import clsx from 'clsx';

// ============================================================================
// VISA COMPLIANCE DASHBOARD - OPERATIONAL INTELLIGENCE
// ============================================================================

const VisaComplianceDashboard = () => {
    const { data: visaData, isLoading } = useQuery({
        queryKey: ['visa-cases'],
        queryFn: () => getVisaCases()
    });

    const cases = visaData?.results || [];

    // Aggregations
    const totalVolume = cases.reduce((sum, c) => sum + (Number(c.ihs_amount) || 0) + (Number(c.visa_fee_amount) || 0), 0);
    const approvedCount = cases.filter(c => c.decision_status === 'APPROVED').length;
    const rejectedCount = cases.filter(c => c.decision_status === 'REJECTED').length;
    const approvalRate = cases.length > 0 ? (approvedCount / (approvedCount + rejectedCount || 1)) * 100 : 0;
    const urgentCount = cases.filter(c => c.priority === 'URGENT').length;

    const statusCounts = cases.reduce((acc: Record<string, number>, c) => {
        acc[c.status_display || c.status] = (acc[c.status_display || c.status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const pieData = [
        { name: 'Approved', value: approvedCount, color: '#10B981' },
        { name: 'Rejected', value: rejectedCount, color: '#F43F5E' },
        { name: 'Pending', value: cases.filter(c => !c.decision_status || c.decision_status === 'PENDING').length, color: '#6366F1' }
    ];

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50/30 gap-6 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                <Globe className="w-8 h-8 animate-spin text-[#7c3aed]" />
            </div>
            <p className="text-xs text-slate-500">Loading visa reports...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFD] p-6 pb-20 space-y-6 animate-in fade-in duration-200">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden">

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-slate-900 rounded-2xl shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">Visas</p>
                            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Visa Reports</h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
                        Visa outcomes, upcoming appointments and fees.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl">
                        <span className="block text-xs font-semibold text-emerald-600 mb-1">Grant Rate</span>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-semibold text-slate-900">{approvalRate.toFixed(1)}%</p>
                            <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                        </div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-2xl">
                        <span className="block text-xs font-semibold text-indigo-600 mb-1">Total Volume</span>
                        <p className="text-3xl font-semibold text-slate-900">£{totalVolume.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active cases', value: cases.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Urgent', value: urgentCount, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Verification Pending', value: cases.filter(c => c.status === 'DOCS_PREPARED').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Passport Ready', value: cases.filter(c => c.status === 'COLLECTION_READY').length, icon: Briefcase, color: 'text-teal-500', bg: 'bg-teal-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 group transition-all duration-200">
                        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm", stat.bg, stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-2">{stat.label}</p>
                        <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Distribution */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 relative overflow-hidden h-[500px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-slate-900">Cases by stage</h3>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500">All cases</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                                    height={60}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                                    labelStyle={{ fontWeight: 900, textTransform: '', fontSize: '10px', color: '#1E293B', marginBottom: '8px' }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#7c3aed' : '#6366F1'} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Decision notes */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 h-[500px] flex flex-col">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Decisions</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-4 w-full mt-8">
                            {pieData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="text-lg font-semibold text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* VFS Appointment Timeline */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">Upcoming VFS appointments</h3>
                    </div>
                    <button className="text-xs font-semibold text-indigo-500 hover:text-[#7c3aed] transition-colors">View all</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.filter(c => c.vfs_date).sort((a, b) => new Date(a.vfs_date!).getTime() - new Date(b.vfs_date!).getTime()).slice(0, 6).map((c, i) => (
                        <div key={i} className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-[#7c3aed]/20 transition-all duration-200">
                            <div className="text-center bg-white w-10 h-10 rounded-lg flex flex-col items-center justify-center border border-slate-200 transition-all">
                                <p className="text-[11px] font-semibold text-slate-400">{new Date(c.vfs_date!).toLocaleString('en-GB', { month: 'short' })}</p>
                                <p className="text-xl font-semibold text-slate-900">{new Date(c.vfs_date!).getDate()}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate mb-0.5">{c.student_details?.full_name}</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                    <p className="text-xs text-slate-500 tracking-tight truncate">{c.vfs_location || 'Centre not set'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-lg text-[11px] font-semibold border",
                                    c.priority === 'URGENT' ? "bg-red-50 text-red-500 border-red-100" : "bg-blue-50 text-blue-500 border-blue-100"
                                )}>
                                    {c.priority || 'NORMAL'}
                                </span>
                                <p className="text-[11px] font-bold text-slate-300">{new Date(c.vfs_date!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    {cases.filter(c => c.vfs_date).length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-20">
                            <Calendar className="w-12 h-12 text-slate-400 mb-4" />
                            <p className="text-xs font-semibold">No upcoming appointments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisaComplianceDashboard;
