import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    forced?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, forced = false }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [agreeMarketing, setAgreeMarketing] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);

    React.useEffect(() => {
        if (!isSignUp) setAgreeTerms(true);
        else setAgreeTerms(false);
    }, [isSignUp]);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                if (!email.includes('@')) {
                    throw new Error('Please enter a valid email address. HomeRoom uses emails for accounts, not usernames.');
                }
                if (!agreeTerms) throw new Error('Please agree to the Terms of Service and Privacy Policy to create an account.');
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            marketing_consent: agreeMarketing
                        }
                    }
                });
                if (error) throw error;
                setMessage('Account created! Please check your email inbox to confirm your account before signing in.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'An error occurred with Google login');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="relative p-8">
                    {!forced && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    )}

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            Sign into your Homeroom
                        </h2>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <a
                                    href="https://ourhomeroom.app/signin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                >
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 animate-in slide-in-from-top-1">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium border border-green-100 animate-in slide-in-from-top-1">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        {isSignUp && (
                            <div className="space-y-4 py-1">
                                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => setAgreeMarketing(!agreeMarketing)}>
                                    <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${agreeMarketing ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-200 group-hover:border-blue-400'}`}>
                                        {agreeMarketing && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs text-slate-600 font-bold leading-tight select-none">Send me classroom tips, updates, and news via email.</span>
                                </div>
                                <div className="flex items-start gap-3 cursor-pointer group" onClick={() => setAgreeTerms(!agreeTerms)}>
                                    <div className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${agreeTerms ? 'bg-blue-600 border-blue-600' : 'bg-slate-100 border-slate-200 group-hover:border-blue-400'}`}>
                                        {agreeTerms && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs text-slate-600 font-bold leading-tight select-none">
                                        I agree to the <a href="https://ourhomeroom.app/terms" target="_blank" className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Terms of Service</a> and <a href="https://ourhomeroom.app/privacy" target="_blank" className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Privacy Policy</a>.
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (isSignUp && !agreeTerms)}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                                </div>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
                                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400 font-bold uppercase tracking-wider">or</span></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="mt-5 w-full py-4 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-700 rounded-2xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="mt-8 text-center bg-slate-50 -mx-8 -mb-8 p-6 border-t border-slate-100">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-slate-500 hover:text-blue-600 font-bold transition-colors text-sm uppercase tracking-wider"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
