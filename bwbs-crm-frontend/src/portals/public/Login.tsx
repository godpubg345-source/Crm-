import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../../services/auth';
import { portalLogin } from '../../services/portal';
import { homePathForRole } from '../../config/roles';
import logo from '../../assets/bwbs-logo.png';
import brandingImage from '../../assets/login-branding.jpg';
import { Shield, FastForward, Sparkles } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);

            const user = getCurrentUser();
            const role = user?.role || '';

            // Students sign in via /portal/login; staff land on their role's portal
            navigate(homePathForRole(role));
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (roleType: 'ADMIN' | 'CEO' | 'COUNSELOR' | 'STUDENT') => {
        setError(null);
        setIsLoading(true);
        try {
            if (roleType === 'STUDENT') {
                await portalLogin('65888f23-1053-4881-a70d-381d5cc6f87c');
                navigate('/portal');
                return;
            }

            let targetEmail = 'admin@bwbs.com';
            let targetPath = '/admin';

            if (roleType === 'CEO') {
                targetEmail = 'staff_uk@bwbs.com';
                targetPath = '/ceo';
            } else if (roleType === 'COUNSELOR') {
                targetEmail = 'employee@bwbs.com';
                targetPath = '/employee-portal';
            }

            setEmail(targetEmail);
            setPassword('admin123');
            await login(targetEmail, 'admin123');
            navigate(targetPath);
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Demo login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side: Seamless Branding Montage */}
            <div className="hidden lg:block relative overflow-hidden bg-black">
                {/* 
                  The image has a black background, so we use a black parent container 
                  to make the image edges disappear seamlessly. 
                */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <img
                        src={brandingImage}
                        alt="Global Presence"
                        className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-700"
                    />
                </div>

                {/* Subtle vignette/gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                {/* Discrete Logo Header in the dark section */}
                <div className="absolute top-10 left-10 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-2xl">
                            <img src={logo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
                        </div>
                        <span className="text-white font-serif font-bold text-lg tracking-wide uppercase">Consultancy ERP</span>
                    </div>
                </div>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-10 left-10 right-10 z-20 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Global Reach</p>
                        <p className="text-white text-2xl font-serif">50+ Countries Connected</p>
                    </div>
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 overflow-hidden shadow-2xl transition-transform hover:scale-110 hover:z-30 cursor-pointer">
                                <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Agent" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Sophisticated Login Form */}
            <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white relative">
                {/* Subtle background flair */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                <div className="w-full max-w-sm relative z-10">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="lg:hidden mb-8 flex justify-center">
                            <img src={logo} alt="Education Consultancy ERP" className="h-12 w-auto" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2 tracking-tight">Login.</h1>
                        <p className="text-xs text-slate-500 font-medium">Access your enterprise consultation toolkit.</p>
                    </header>

                    {/* ── 1-Click Demo Showcase Bar ─────────────────── */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-slate-50 to-indigo-50/80 border border-purple-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                                <Sparkles className="w-3.5 h-3.5 text-[#AD03DE]" />
                                <span>1-Click Demo Personas</span>
                            </div>
                            <span className="text-[9px] font-bold tracking-wider uppercase text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">Gig / Demo Ready</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin('ADMIN')}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group active:scale-95"
                            >
                                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-xs shadow-inner">
                                    👑
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#AD03DE] transition-colors leading-tight">Admin</p>
                                    <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin('CEO')}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group active:scale-95"
                            >
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs shadow-inner">
                                    💼
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#AD03DE] transition-colors leading-tight">CEO Suite</p>
                                    <p className="text-[10px] text-slate-400 truncate">Executive</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin('COUNSELOR')}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group active:scale-95"
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs shadow-inner">
                                    🧑‍💼
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#AD03DE] transition-colors leading-tight">Counselor</p>
                                    <p className="text-[10px] text-slate-400 truncate">Employee</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickLogin('STUDENT')}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left group active:scale-95"
                            >
                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-xs shadow-inner">
                                    🎓
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#AD03DE] transition-colors leading-tight">Student</p>
                                    <p className="text-[10px] text-slate-400 truncate">Priya (Portal)</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="relative flex py-1 items-center mb-5">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or Credentials</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    {/* Alert */}
                    {error && (
                        <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100/50 text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="font-medium leading-relaxed">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                Identity
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email Address"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-sm font-medium"
                            />
                        </div>

                        <div className="group space-y-2 text-primary">
                            <div className="flex items-center justify-between ml-1 text-slate-400">
                                <label className="text-xs font-bold uppercase tracking-widest group-focus-within:text-primary transition-colors">
                                    Security
                                </label>
                                <a href="#" className="text-[11px] font-bold hover:text-primary transition-colors uppercase tracking-wider">Recover?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 shadow-sm font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <div className="relative flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/50 cursor-pointer"
                                />
                            </div>
                            <label htmlFor="remember" className="text-sm text-slate-500 font-medium cursor-pointer select-none">
                                Maintain session
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 px-6 rounded-2xl font-bold text-white bg-primary hover:bg-[#9302bb] shadow-2xl shadow-primary/25 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in to ERP</span>
                                    <FastForward className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <footer className="mt-16 pt-10 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">System Active</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                © 2026 Education Consultancy
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
