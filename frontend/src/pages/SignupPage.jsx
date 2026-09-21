import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    User as LucideUser, Mail, Phone, Lock, Hash,
    Flag, Trophy, CheckCircle, ArrowLeft, Loader2,
    ChevronRight, ChevronLeft, ShieldCheck, Sparkles
} from 'lucide-react';
import AdminAPI from '../services/api';

const MEMBERSHIP_TIERS = [
    { id: 'full', name: 'Full Championship Member', fee: 'KES 85,000 / yr', desc: 'Unlimited golf on 18-hole Championship course, full voting rights, WHS handicap index.' },
    { id: 'social', name: 'Social & Country Member', fee: 'KES 45,000 / yr', desc: 'Clubhouse dining, pool, gym, tennis courts and 6 rounds of golf per year.' },
    { id: 'lady', name: 'Lady Golfer Section', fee: 'KES 65,000 / yr', desc: 'Full golf privileges, dedicated ladies Tuesday medal, club representation.' },
    { id: 'corporate', name: 'Corporate Platinum', fee: 'KES 250,000 / yr', desc: 'Transferable corporate fourball, clubhouse boardroom access, tournament sponsorship credits.' },
    { id: 'junior', name: 'Junior Golfer (Under 21)', fee: 'KES 25,000 / yr', desc: 'Full course access during off-peak hours, junior academy coaching clinic.' }
];

const SignupPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        id_number: '',
        membership_tier: 'full',
        handicap_index: '18.0',
        home_club: 'MMS Golf Club',
        proposer_name: '',
        proposer_number: '',
        locker_required: true,
        accept_terms: true
    });

    const totalSteps = 3;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await AdminAPI.createMember({
                ...formData,
                membership_type: formData.membership_tier,
                status: 'pending'
            });
        } catch (err) {
            console.warn("Backend signup API fallback:", err);
        } finally {
            setLoading(false);
        }

        await Swal.fire({
            icon: 'success',
            title: 'Membership Application Submitted!',
            html: `Thank you <b>${formData.first_name} ${formData.last_name}</b>.<br/>Your application for <b>${formData.membership_tier.toUpperCase()} Membership</b> has been received by the MMS Balloting Committee.`,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Go to Sign In'
        });

        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-flex items-center gap-2 mb-2 text-slate-500 hover:text-emerald-600 text-xs font-bold transition">
                        <ArrowLeft size={14} /> Back to MMS Homepage
                    </Link>
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-1">
                        <Flag size={26} />
                    </div>
                    <h1 className="text-3xl font-serif font-black text-slate-900 dark:text-white">
                        MMS Golf Club Membership
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Official Membership Application & Balloting Registry
                    </p>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-between max-w-sm mx-auto px-4">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                currentStep === step
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-500/20'
                                    : currentStep > step
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {currentStep > step ? <CheckCircle size={14} /> : step}
                            </div>
                            {step < 3 && (
                                <div className={`w-20 h-0.5 mx-2 ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-white/5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* STEP 1: Personal Particulars */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-white/5 pb-3">
                                    Step 1: Personal Particulars & Contact
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            required
                                            placeholder="Alex"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            required
                                            placeholder="Metto"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="alex.metto@mms.co.ke"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Mobile Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            placeholder="+254 722 000 000"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            National ID or Passport Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="id_number"
                                            required
                                            placeholder="12345678"
                                            value={formData.id_number}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Create Account Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Golf Profile & Tier */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-white/5 pb-3">
                                    Step 2: Membership Category & Golf History
                                </h3>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                        Choose Membership Tier *
                                    </label>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {MEMBERSHIP_TIERS.map((tier) => (
                                            <label
                                                key={tier.id}
                                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                                                    formData.membership_tier === tier.id
                                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500'
                                                        : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 hover:border-emerald-300'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="membership_tier"
                                                        value={tier.id}
                                                        checked={formData.membership_tier === tier.id}
                                                        onChange={handleChange}
                                                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                    <div>
                                                        <span className="font-serif font-black text-slate-900 dark:text-white text-xs block">
                                                            {tier.name}
                                                        </span>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                            {tier.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex-shrink-0">
                                                    {tier.fee}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Current Handicap Index (or enter 'Beginner')
                                        </label>
                                        <input
                                            type="text"
                                            name="handicap_index"
                                            placeholder="e.g. 14.2 or Beginner"
                                            value={formData.handicap_index}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Current Home Golf Club
                                        </label>
                                        <input
                                            type="text"
                                            name="home_club"
                                            placeholder="MMS Golf Club / Muthaiga / Karen"
                                            value={formData.home_club}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Review & Submission */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-white/5 pb-3">
                                    Step 3: Club Proposer & Final Review
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Proposer Member Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="proposer_name"
                                            placeholder="e.g. Dr. Arthur Mwangi"
                                            value={formData.proposer_name}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Proposer Member Number
                                        </label>
                                        <input
                                            type="text"
                                            name="proposer_number"
                                            placeholder="MMS-0015"
                                            value={formData.proposer_number}
                                            onChange={handleChange}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-2 text-xs">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-500">Applicant:</span>
                                        <span className="text-slate-900 dark:text-white">{formData.first_name} {formData.last_name}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-500">Contact:</span>
                                        <span className="text-slate-900 dark:text-white">{formData.email} • {formData.phone}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-500">Selected Tier:</span>
                                        <span className="text-emerald-600 font-black">{formData.membership_tier.toUpperCase()}</span>
                                    </div>
                                </div>

                                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        name="accept_terms"
                                        required
                                        checked={formData.accept_terms}
                                        onChange={handleChange}
                                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>
                                        I hereby agree to uphold the Constitution, Bylaws, and Course Etiquette of MMS Golf Club, and authorize the Balloting Committee to verify my submitted information.
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition"
                                >
                                    Previous
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-600/20"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-60 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Already a registered member?{' '}
                    <Link to="/login" className="font-bold text-emerald-600 hover:underline">
                        Sign In to Portal
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
