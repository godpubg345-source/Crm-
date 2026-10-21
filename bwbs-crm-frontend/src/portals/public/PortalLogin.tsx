import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { portalLogin } from '../../services/portal';
import logo from '../../assets/bwbs-logo.png';
import { LogIn, ShieldCheck, ArrowRight, Loader2, Sparkles, GraduationCap } from 'lucide-react';

const PortalLogin: React.FC = () => {
    const [credential, setCredential] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const doLogin = async (tokenOrEmail: string) => {
        setIsLoading(true);
        setError('');
        try {
            await portalLogin(tokenOrEmail);
            navigate('/portal');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Invalid or expired invite token. You can also sign in using your registered Student Email or Student Code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credential.trim()) return;
        await doLogin(credential.trim());
    };

    const handleQuickDemo = async () => {
        setCredential('65888f23-1053-4881-a70d-381d5cc6f87c');
        await doLogin('65888f23-1053-4881-a70d-381d5cc6f87c');
    };

    return (
        <div className="min-h-screen bg-[#fcfaff] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Education Consultancy ERP" className="h-10 w-auto" />
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(173,3,222,0.07)] border border-purple-100/60 p-8 sm:p-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <GraduationCap className="w-7 h-7 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Student Space
                        </span>
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-1 font-serif tracking-tight">Student Portal</h1>
                    <p className="text-slate-500 mb-6 text-sm font-medium">Access your university applications, offers, visa milestones & document vault.</p>

                    {/* Instant Demo Student Button */}
                    <button
                        type="button"
                        onClick={handleQuickDemo}
                        disabled={isLoading}
                        className="w-full mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border border-purple-200/80 hover:border-purple-400 flex items-center justify-between text-left transition-all group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-purple-950 group-hover:text-purple-700 flex items-center gap-1">
                                    Instant Demo Student
                                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold">1-Click</span>
                                </p>
                                <p className="text-[11px] text-purple-700/80 font-semibold">Priya Sharma • Imperial College London Offer</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="relative flex items-center justify-center mb-6">
                        <div className="border-t border-purple-100/80 w-full" />
                        <span className="bg-white px-3 text-[10px] uppercase font-black tracking-widest text-slate-400">or sign-in with your details</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="token" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Invite Token, Student Email or Student ID
                            </label>
                            <div className="relative group">
                                <input
                                    id="token"
                                    type="text"
                                    required
                                    value={credential}
                                    onChange={(e) => setCredential(e.target.value)}
                                    className="w-full h-13 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-medium text-sm hover:border-purple-200 focus:border-purple-500 focus:bg-white outline-none transition-all"
                                    placeholder="priya.sharma@example.com or token"
                                />
                                <LogIn className="absolute right-4 top-3.5 w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-colors" />
                            </div>
                            {error && <p className="mt-2 text-xs font-bold text-rose-500 pl-1">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-13 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group mt-6 cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Command Center</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <Link to="/login" className="text-xs font-black text-slate-400 hover:text-slate-700 transition-colors">
                            ← Switch to Central Portal Login (Admin / Staff)
                        </Link>
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Secure Access • Education Consultancy Group
                </p>
            </div>
        </div>
    );
};

export default PortalLogin;
