import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import logo from '../assets/bwbs-logo.png';
import brandingImage from '../assets/login-branding.jpg';
import { Shield, FastForward } from 'lucide-react';

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
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { message?: string };
            setError(error.message || 'Login failed. Please try again.');
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
                        alt="BWBS Global Presence"
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
                        <span className="text-white font-serif font-bold text-lg tracking-wide uppercase">BWBS Portal</span>
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
                    <header className="mb-12">
                        <div className="lg:hidden mb-10 flex justify-center">
                            <img src={logo} alt="BWBS Education" className="h-14 w-auto" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Login.</h1>
                        <p className="text-slate-500 font-medium">Access your enterprise consultation toolkit.</p>
                    </header>

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
                                    <span>Sign in to BWBS</span>
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
                                © 2026 BWBS Consultants Ltd
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Login;
