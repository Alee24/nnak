import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    User as LucideUser, Mail, Phone, Lock, Hash,
    Briefcase, GraduationCap, MapPin,
    CheckCircle, ArrowLeft, Loader2,
    Building2, ClipboardList, ShieldCheck,
    ChevronRight, ChevronLeft, Camera, Upload, X
} from 'lucide-react';

const SignupPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '', password: '',
        registration_number: '', id_number: '', occupation: 'Nurse',
        gender: 'female', sub_county: '', county: '', work_station: '',
        qualifications: '', designation: '', personal_number: '',
        chapter: '', cadre: '', employment_status: 'Full-time', is_signed: 1,
        address_line1: '', profile_picture: null
    });

    const totalSteps = 5;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'File Too Large',
                    text: 'Please select an image smaller than 2MB',
                    confirmButtonColor: '#059669'
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profile_picture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, profile_picture: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    signature_date: new Date().toISOString().split('T')[0]
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Registration Submitted',
                    text: 'Your application has been received and is pending review. You will receive an email once approved.',
                    confirmButtonColor: '#059669'
                });
                navigate('/login');
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: error.message,
                confirmButtonColor: '#059669'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => {
        const steps = [
            { id: 1, name: 'Personal', desc: 'Contact Details' },
            { id: 2, name: 'Professional', desc: 'Work & License' },
            { id: 3, name: 'Regional', desc: 'Location' },
            { id: 4, name: 'Photo', desc: 'Identification' },
            { id: 5, name: 'Review', desc: 'Submission' }
        ];

        return (
            <div className="space-y-8 py-8 pl-4">
                {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4 group">
                        <div className={`relative flex flex-col items-center`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 font-bold transition-all duration-500 z-10 ${step.id === currentStep ? 'bg-white text-emerald-900 border-white scale-110 shadow-xl shadow-white/20' :
                                step.id < currentStep ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-transparent border-white/20 text-white/40'
                                }`}>
                                {step.id < currentStep ? <CheckCircle size={20} /> : step.id}
                            </div>
                            {step.id < 5 && (
                                <div className={`w-0.5 h-8 absolute top-10 transition-all duration-500 ${step.id < currentStep ? 'bg-emerald-400' : 'bg-white/10'}`}></div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-[11px] font-black uppercase tracking-widest ${step.id === currentStep ? 'text-white' : 'text-white/40'}`}>
                                {step.name}
                            </span>
                            <span className={`text-[10px] font-bold ${step.id === currentStep ? 'text-emerald-400' : 'text-white/20'}`}>
                                {step.desc}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="h-screen bg-white flex overflow-hidden">
            {/* Left Panel: Branding & Progress */}
            <div className="hidden lg:flex w-[400px] bg-slate-900 relative flex-col justify-between overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full -ml-40 -mb-40 blur-3xl"></div>

                <div className="relative z-10 p-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">N</div>
                        <span className="font-black text-white tracking-tighter text-2xl uppercase">NNAK <span className="text-emerald-400">Portal</span></span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-white mb-2 leading-tight tracking-tighter uppercase">Member<br /><span className="text-emerald-400">Enrollment</span></h1>
                        <p className="text-white/50 text-sm font-medium">Step into a world of professional nursing excellence.</p>
                    </div>

                    {renderStepIndicator()}
                </div>

                <div className="relative z-10 p-10 border-t border-white/5 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-4 text-white/60">
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                            <ShieldCheck size={16} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Secure data encryption & professional verification.</p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form Content */}
            <div className="flex-1 flex flex-col h-full bg-gray-50/50 relative">
                {/* Mobile Header / Top Bar */}
                <div className="h-16 flex justify-between items-center px-6 lg:px-12 flex-shrink-0 bg-white border-b border-gray-100 z-10">
                    <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-emerald-600 transition font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={16} />
                        Exit to Login
                    </Link>

                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-sm">N</div>
                        <span className="font-black text-gray-900 tracking-tighter text-sm uppercase">NNAK</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {currentStep} of {totalSteps}</p>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-2xl mx-auto py-12 px-6 lg:px-0">
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
                            {/* Step Indicator for Mobile */}
                            <div className="lg:hidden mb-8">
                                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                        {currentStep}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase">
                                            {currentStep === 1 ? 'Personal' : currentStep === 2 ? 'Professional' : currentStep === 3 ? 'Regional' : currentStep === 4 ? 'Photo' : 'Review'}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enrollment Progress</p>
                                    </div>
                                </div>
                            </div>

                            {/* Forms ... */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                            <LucideUser size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Personal Details</h2>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Step 01: Identification</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                                                <div className="relative group">
                                                    <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="text" name="first_name" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.first_name} onChange={handleChange} placeholder="Jane" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                                                <div className="relative group">
                                                    <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="text" name="last_name" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.last_name} onChange={handleChange} placeholder="Doe" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="email" name="email" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.email} onChange={handleChange} placeholder="jane.doe@example.com" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="tel" name="phone" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.phone} onChange={handleChange} placeholder="+254..." />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">National ID / Passport</label>
                                                <div className="relative group">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="text" name="id_number" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-mono font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.id_number} onChange={handleChange} placeholder="12345678" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                                                <select name="gender" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none"
                                                    value={formData.gender} onChange={handleChange}>
                                                    <option value="female">Female</option>
                                                    <option value="male">Male</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Create Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                                    <input required type="password" name="password" className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                                                        value={formData.password} onChange={handleChange} placeholder="••••••••" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Professional Details</h2>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Step 02: Verification</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Employee Status</label>
                                                <select name="employment_status" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                                                    value={formData.employment_status} onChange={handleChange}>
                                                    <option value="Full-time">Full-time</option>
                                                    <option value="Part-time">Part-time</option>
                                                    <option value="Self-employed">Self-employed</option>
                                                    <option value="Student">Student</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Occupation</label>
                                                <select name="occupation" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                                                    value={formData.occupation} onChange={handleChange}>
                                                    <option value="Nurse">Registered Nurse</option>
                                                    <option value="Midwife">Midwife</option>
                                                    <option value="Student">Student Nurse</option>
                                                    <option value="Associate">Associate</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Designation</label>
                                                <input required type="text" name="designation" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.designation} onChange={handleChange} placeholder="Nursing Officer" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">License No.</label>
                                                <input type="text" name="registration_number" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-mono font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.registration_number} onChange={handleChange} placeholder="REG-12345" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Qualifications</label>
                                                <input required type="text" name="qualifications" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.qualifications} onChange={handleChange} placeholder="BSc. Nursing, etc." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Regional Info</h2>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Step 03: Location</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">County</label>
                                                <input required type="text" name="county" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.county} onChange={handleChange} placeholder="Nairobi" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sub-County</label>
                                                <input required type="text" name="sub_county" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.sub_county} onChange={handleChange} placeholder="Westlands" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">NNAK Chapter</label>
                                                <input required type="text" name="chapter" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.chapter} onChange={handleChange} placeholder="Nairobi Branch" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Work Station / Facility</label>
                                                <input required type="text" name="work_station" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                    value={formData.work_station} onChange={handleChange} placeholder="Kenyatta National Hospital" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                            <Camera size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Profile Photo</h2>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Step 04: Visual Identity</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center">
                                        <div className={`w-48 h-60 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all bg-gray-50 relative overflow-hidden group ${formData.profile_picture ? 'border-emerald-500' : 'border-gray-200'}`}>
                                            {formData.profile_picture ? (
                                                <img src={formData.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera size={40} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                            )}
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-2">Requirements</h4>
                                                <ul className="text-[11px] text-emerald-600/80 font-bold space-y-1">
                                                    <li>• Passport style (vertical aspect)</li>
                                                    <li>• White or light background</li>
                                                    <li>• Max file size: 2MB</li>
                                                </ul>
                                            </div>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition">
                                                {formData.profile_picture ? 'Change Photo' : 'Select Photo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                                            <ClipboardList size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Review Summary</h2>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Final Phase</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Full Name</span>
                                                <span className="text-sm font-bold text-gray-800">{formData.first_name} {formData.last_name}</span>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">License</span>
                                                <span className="text-sm font-bold text-gray-800">{formData.registration_number || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-emerald-900 rounded-2xl text-white">
                                            <p className="text-[10px] font-medium leading-relaxed opacity-80">
                                                I hereby certify that all information provided is accurate and I agree to the NNAK terms of service.
                                            </p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <input required type="checkbox" id="agree" className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500" />
                                                <label htmlFor="agree" className="text-xs font-bold">I agree to terms</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sticky Footer for Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-6 px-6 sticky bottom-0 z-10 lg:static lg:bg-transparent lg:px-0 lg:mx-0">
                                {currentStep > 1 && (
                                    <button type="button" onClick={prevStep} className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 transition">
                                        Back
                                    </button>
                                )}
                                {currentStep < totalSteps ? (
                                    <button type="button" onClick={nextStep} className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20">
                                        Continue
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-emerald-900 text-white rounded-2xl text-sm font-bold hover:bg-emerald-950 transition shadow-lg">
                                        {loading ? 'Processing...' : 'Finish Enrollment'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
