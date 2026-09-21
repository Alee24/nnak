import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, Lock, Loader, ArrowRight, ShieldCheck, KeyRound, Flag, Trophy, Sparkles } from 'lucide-react';
import AdminAPI from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
    const [isDemoMode, setIsDemoMode] = useState(true);
    const [formData, setFormData] = useState({
        email: 'gm@mmsgolfclub.co.ke',
        password: '',
        otp: '2424'
    });

    useEffect(() => {
        const checkDemoMode = async () => {
            try {
                const res = await AdminAPI.getPublicSettings();
                const dm = res?.settings?.demo_mode;
                if (dm !== undefined) {
                    setIsDemoMode(dm === '1' || dm === 'true' || dm === true);
                }
            } catch (e) {
                // Keep default demo mode enabled on error
            }
        };
        checkDemoMode();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await AdminAPI.login(formData.email, formData.password);

            if (response.success) {
                if (response.otp_required) {
                    setStep(2);
                    Swal.fire({
                        icon: 'info',
                        title: 'OTP Required',
                        text: 'A verification code has been sent to your registered email/phone.',
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                } else {
                    loginSuccess();
                }
            } else {
                throw new Error(response.error || 'Invalid credentials');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Sign In Failed',
                text: error.message || 'Please check your email and password',
                confirmButtonColor: '#059669'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await AdminAPI.verifyOtp(formData.otp);

            if (response.success) {
                loginSuccess();
            } else {
                throw new Error(response.error || 'Invalid verification code');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: error.message,
                confirmButtonColor: '#059669'
            });
        } finally {
            setLoading(false);
        }
    };

    const loginSuccess = async () => {
        await Swal.fire({
            icon: 'success',
            title: 'Welcome to MMS Golf Club',
            text: 'Sign in authenticated. Opening portal...',
            timer: 1500,
            showConfirmButton: false,
            background: '#f0fdf4',
            color: '#166534'
        });
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 font-['Inter']">
            {/* Left Side - Luxury Golf Heritage */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(5,150,105,0.15),transparent_70%)]"></div>
                
                <div className="relative z-10 flex flex-col justify-between p-16 h-full text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-emerald-600/30 border border-emerald-500/40 rounded-2xl flex items-center justify-center shadow-lg">
                                <Flag className="text-emerald-400" size={24} />
                            </div>
                            <div>
                                <span className="font-serif font-black text-2xl tracking-tight block">MMS GOLF CLUB</span>
                                <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-black block">Championship Course & Country Club</span>
                            </div>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-serif font-black mb-6 leading-tight">
                            Excellence in Golf & Heritage Since 1987
                        </h1>
                        <p className="text-emerald-100/80 text-base max-w-lg leading-relaxed">
                            Welcome to Kenya's premier championship golf estate. Manage your tee times, track your World Handicap System index, register for sanctioned tournaments, and access luxury clubhouse dining.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                <span className="text-2xl font-black text-emerald-400 block">18</span>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mt-1">Championship Holes</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                <span className="text-2xl font-black text-emerald-400 block">500+</span>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mt-1">Active Members</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                <span className="text-2xl font-black text-emerald-400 block">WHS</span>
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mt-1">Sanctioned Index</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold pt-2">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Private Member Portal • Protected by MMS Security Suite</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 lg:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-2">
                            {step === 1 ? <Lock size={24} /> : <ShieldCheck size={24} className="animate-pulse" />}
                        </div>
                        <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white">
                            {step === 1 ? 'Member Access Portal' : 'Security Verification'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {step === 1
                                ? 'Sign in with your registered email and password'
                                : `Enter the 4-digit code sent to ${formData.email}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                                    Member / Staff Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 outline-none focus:border-emerald-500 transition"
                                        placeholder="gm@mmsgolfclub.co.ke"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                                    Account Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 outline-none focus:border-emerald-500 transition"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                                    <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                                    <span>Remember credentials</span>
                                </label>
                                <a href="#" className="font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {/* Demo Credentials Helper Box (Shown ONLY when demo_mode is ON) */}
                            {isDemoMode && (
                                <div className="p-3.5 bg-emerald-50/70 dark:bg-slate-700/50 rounded-xl border border-emerald-200 dark:border-slate-600 text-[11px] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-emerald-800 dark:text-emerald-300 uppercase text-[9px] tracking-wider flex items-center gap-1">
                                            <Sparkles size={11} className="text-emerald-600" />
                                            Active Demo Accounts (Click to Fill):
                                        </span>
                                        <span className="text-[9px] font-mono font-bold text-slate-500">Pass: Digital2025 | OTP: 2424</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                                        {[
                                            { label: 'General Manager', email: 'gm@mmsgolfclub.co.ke' },
                                            { label: 'Club Member', email: 'member@mmsgolfclub.co.ke' },
                                            { label: 'Golf Pro', email: 'pro@mmsgolfclub.co.ke' },
                                            { label: 'Finance Director', email: 'finance@mmsgolfclub.co.ke' },
                                            { label: 'Club Cashier', email: 'cashier@mmsgolfclub.co.ke' },
                                            { label: 'Front Desk', email: 'reception@mmsgolfclub.co.ke' }
                                        ].map((acc) => (
                                            <button
                                                key={acc.email}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        email: acc.email,
                                                        password: 'Digital2025',
                                                        otp: '2424'
                                                    });
                                                }}
                                                className="text-left px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-slate-200 dark:border-slate-600 transition truncate group"
                                            >
                                                <span className="block font-bold text-[10px] text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                                                    {acc.label}
                                                </span>
                                                <span className="block text-[8px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                                    {acc.email}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center mb-2">
                                    4-Digit Verification Code
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        maxLength={4}
                                        className="block w-full py-4 border-2 border-emerald-500 rounded-2xl bg-slate-50 dark:bg-slate-700 text-center text-3xl font-mono font-black tracking-[0.5em] text-slate-900 dark:text-white outline-none"
                                        placeholder="0000"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest mt-2">
                                    Default code: <strong className="text-emerald-600">2424</strong>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || formData.otp.length < 4}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader className="animate-spin h-4 w-4 text-white" />
                                ) : (
                                    'Confirm & Launch Dashboard'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 transition text-center"
                            >
                                Back to Sign In
                            </button>
                        </form>
                    )}

                    <div className="pt-2 text-center border-t border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Interested in joining?{' '}
                            <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                Apply for Club Membership
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
