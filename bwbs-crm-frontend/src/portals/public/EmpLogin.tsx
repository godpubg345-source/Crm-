import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { empPortalLogin } from '../../services/empPortal';
import logo from '../../assets/bwbs-logo.png';
import { LogIn, KeyRound, Loader2, ArrowRight, Sparkles, UserCheck, Shield } from 'lucide-react';

const EmpPortalLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const doLogin = async (loginEmail: string, loginPass: string) => {
        setIsLoading(true);
        setError('');
        try {
            await empPortalLogin({ email: loginEmail, password: loginPass });
            navigate('/employee-portal');
        } catch (err: any) {
            setError(err.message || err.response?.data?.detail || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password) return;
        await doLogin(email, password);
    };

    const handleQuickDemo = async () => {
        setEmail('employee@bwbs.com');
        setPassword('admin123');
        await doLogin('employee@bwbs.com', 'admin123');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] opacity-60 translate-y-1/2 -translate-x-1/3" />

            <div className="max-w-md w-full relative z-10">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Education Consultancy ERP" className="h-10 w-auto" />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
                            <KeyRound className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Staff Portal
                        </span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-1 font-serif tracking-tight">Employee Space</h1>
                    <p className="text-slate-500 mb-6 text-sm font-medium">Log in with your credentials to access your admissions & counseling desk.</p>

                    {/* Quick Demo Login Pill */}
                    <button
                        type="button"
                        onClick={handleQuickDemo}
                        disabled={isLoading}
                        className="w-full mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200/80 hover:border-teal-400 flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-teal-900 group-hover:text-teal-700 flex items-center gap-1">
                                    Instant Demo Counselor
                                    <span className="text-[9px] bg-teal-200 text-teal-800 px-1.5 py-0.2 rounded font-bold">1-Click</span>
                                </p>
                                <p className="text-[11px] text-teal-700/80 font-semibold">Sarah Jenkins • employee@bwbs.com</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="relative flex items-center justify-center mb-6">
                        <div className="border-t border-slate-100 w-full" />
                        <span className="bg-white px-3 text-[10px] uppercase font-black tracking-widest text-slate-400">or manual sign-in</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-medium text-sm hover:border-teal-200 focus:border-teal-500 focus:bg-white outline-none transition-all"
                                placeholder="employee@bwbs.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-medium text-sm hover:border-teal-200 focus:border-teal-500 focus:bg-white outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <LogIn className="absolute right-4 top-3.5 w-5 h-5 text-slate-300 group-hover:text-teal-400 transition-colors" />
                            </div>
                            {error && <p className="mt-2 text-xs font-bold text-rose-500 pl-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-13 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group mt-6 cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Access Counselor Desk</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <Link to="/login" className="text-xs font-black text-slate-400 hover:text-slate-700 transition-colors">
                            ← Switch to Central Portal Login (Admin / CEO)
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Secure Access • Staff Only
                </p>
            </div>
        </div>
    );
};

export default EmpPortalLogin;
