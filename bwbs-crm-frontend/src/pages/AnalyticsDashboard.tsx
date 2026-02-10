import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, Users, FileText, BadgeDollarSign,
    Filter, Download, Calendar, ArrowUpRight, ArrowDownRight,
    RefreshCw, Target, UserCheck
} from 'lucide-react';
import analyticsService from '../services/analytics';
import { StatCard } from '../components/dashboard/StatCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5 }
    }
};

const COLORS = ['#6366f1', '#AD03DE', '#10b981', '#f59e0b', '#ef4444'];

const AnalyticsDashboard = () => {
    const [activeTab, setActiveTab] = useState<'performance' | 'counselors' | 'forecast'>('performance');
    const [period, setPeriod] = useState('30d');

    const performanceQuery = useQuery({
        queryKey: ['analytics', 'performance', period],
        queryFn: () => analyticsService.getBranchPerformance({ period }),
    });

    const counselorKpiQuery = useQuery({
        queryKey: ['analytics', 'counselors', period],
        queryFn: () => analyticsService.getCounselorKpis({ period }),
        enabled: activeTab === 'counselors'
    });

    const forecastQuery = useQuery({
        queryKey: ['analytics', 'forecast'],
        queryFn: () => analyticsService.getForecast({ period: '6m' }),
        enabled: activeTab === 'forecast'
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto p-2 pb-20"
        >
            {/* Header section with Glassmorphism */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-1 bg-[#AD03DE] text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                            Intelligence Hub
                        </div>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs font-medium text-slate-500">Global Analytics Dashboard</span>
                    </div>
                    <h1 className="text-3xl font-serif font-black text-slate-900 tracking-tight">
                        Predictive Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Synthesizing operational data into actionable strategic insights.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#AD03DE]/20 transition-all font-bold"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 3 Months</option>
                        <option value="12m">Last Year</option>
                    </select>
                    <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                        <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Premium Tab Navigation */}
            <motion.div variants={itemVariants} className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit backdrop-blur-sm border border-slate-200/50">
                {(['performance', 'counselors', 'forecast'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 uppercase tracking-wider ${activeTab === tab
                                ? 'bg-white text-[#AD03DE] shadow-md ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {activeTab === 'performance' && (
                <div className="space-y-8">
                    {/* Stat Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Revenue"
                            value="£421,800"
                            icon={BadgeDollarSign}
                            trend="+14.2% vs prev period"
                        />
                        <StatCard
                            title="Lead Conversion"
                            value="28.4%"
                            icon={TrendingUp}
                            trend="+2.1% efficiency gain"
                        />
                        <StatCard
                            title="Active Students"
                            value="1,248"
                            icon={Users}
                            trend="+52 new this month"
                        />
                        <StatCard
                            title="Application Success"
                            value="94.1%"
                            icon={UserCheck}
                            trend="Top tier performance"
                        />
                    </div>

                    {/* Chart Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group min-h-[450px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-serif font-black text-slate-900">Conversion Pipeline</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead to enrollment velocity</p>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { name: 'Week 1', leads: 400, conv: 240 },
                                        { name: 'Week 2', leads: 300, conv: 139 },
                                        { name: 'Week 3', leads: 200, conv: 980 },
                                        { name: 'Week 4', leads: 278, conv: 390 },
                                        { name: 'Week 5', leads: 189, conv: 480 },
                                    ]}>
                                        <defs>
                                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#AD03DE" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#AD03DE" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            cursor={{ stroke: '#AD03DE', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        />
                                        <Area type="monotone" dataKey="leads" stroke="#AD03DE" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-slate-900">Branch Share</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue distribution by region</p>
                            </div>

                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'London', value: 400 },
                                                { name: 'Manchester', value: 300 },
                                                { name: 'Birmingham', value: 300 },
                                                { name: 'Glasgow', value: 200 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {COLORS.map((color, index) => (
                                                <Cell key={`cell-${index}`} fill={color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2">
                                {['London', 'Manchester', 'Birmingham', 'Glasgow'].map((branch, i) => (
                                    <div key={branch} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                            <span className="text-xs font-bold text-slate-600">{branch}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">£{(400 - i * 50).toLocaleString()}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'counselors' && (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-serif font-black text-slate-900">Counselor Performance Ledger</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Individual contribution & efficiency metrics</p>
                        </div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider">
                            Real-time Sync
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Counselor</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Leads Assigned</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Converted</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Efficiency</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenue</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { name: 'Sarah Jenkins', leads: 420, conv: 124, eff: '29.5%', rev: '£84k', trend: 'up' },
                                    { name: 'Michael Chen', leads: 380, conv: 110, eff: '28.9%', rev: '£72k', trend: 'up' },
                                    { name: 'Amara Okafor', leads: 450, conv: 115, eff: '25.5%', rev: '£68k', trend: 'down' },
                                    { name: 'David Smith', leads: 310, conv: 92, eff: '29.6%', rev: '£61k', trend: 'up' },
                                    { name: 'Elena Rodriguez', leads: 400, conv: 104, eff: '26.0%', rev: '£59k', trend: 'stable' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-900">{row.name}</td>
                                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{row.leads}</td>
                                        <td className="px-8 py-5 text-sm text-slate-700 font-bold">{row.conv}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[60px] overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: row.eff }}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-slate-900">{row.eff}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-[#AD03DE]">{row.rev}</td>
                                        <td className="px-8 py-5 text-right">
                                            {row.trend === 'up' && <ArrowUpRight className="w-5 h-5 text-emerald-500 ml-auto" />}
                                            {row.trend === 'down' && <ArrowDownRight className="w-5 h-5 text-rose-500 ml-auto" />}
                                            {row.trend === 'stable' && <RefreshCw className="w-4 h-4 text-slate-300 ml-auto animate-spin-slow" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'forecast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group min-h-[450px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-slate-900">Revenue Projection</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stochastic 6-month growth forecast</p>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <RefreshCw className="w-6 h-6 animate-spin-slow" />
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { month: 'Mar', actual: 45, projected: 48 },
                                    { month: 'Apr', actual: 52, projected: 55 },
                                    { month: 'May', actual: 0, projected: 62 },
                                    { month: 'Jun', actual: 0, projected: 68 },
                                    { month: 'Jul', actual: 0, projected: 75 },
                                    { month: 'Aug', actual: 0, projected: 82 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="actual" fill="#AD03DE" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="projected" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-2xl font-serif font-black text-white italic">Intelligence Brief</h3>
                                <div className="mt-6 space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Target className="w-5 h-5 text-purple-400" />
                                            <span className="text-xs font-black uppercase tracking-widest text-purple-200">Growth Analysis</span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Current trajectory suggests a <span className="text-white font-bold">18.4% increase</span> in regional lead volume. Focus on London and Manchester hubs to capture maximum market share.
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Users className="w-5 h-5 text-[#10b981]" />
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">Staffing Recommendations</span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Predictive staffing model indicates a requirement for <span className="text-white font-bold">4 additional counselors</span> by Q3 to maintain current conversion efficiency levels.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-colors shadow-2xl">
                                Generate Full Strategic Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AnalyticsDashboard;
