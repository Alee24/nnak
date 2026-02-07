import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Award, BookOpen, Users, Star, Layers, Globe, ShieldCheck } from 'lucide-react';

const BenefitsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <LandingNavbar />

            <div className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                            <Star className="w-5 h-5 text-emerald-500 fill-current" />
                            <span className="text-sm font-bold text-emerald-800 tracking-wide uppercase">Membership Benefits</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                            Elevate Your Nursing Career <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">With NNAK Membership</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Join a community dedicated to professional excellence, advocacy, and welfare. Discover why thousands of nurses choose NNAK.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={<Award className="w-8 h-8 text-emerald-600" />}
                            title="Professional Recognition"
                            description="Gain official recognition as a registered member of the National Nurses Association of Kenya, enhancing your professional standing."
                        />
                        <BenefitCard
                            icon={<BookOpen className="w-8 h-8 text-teal-600" />}
                            title="CPD Opportunities"
                            description="Access exclusive Continuous Professional Development (CPD) courses, workshops, and seminars to keep your skills sharp."
                        />
                        <BenefitCard
                            icon={<Users className="w-8 h-8 text-blue-600" />}
                            title="Networking & Community"
                            description="Connect with peers, mentors, and industry leaders through conferences, local chapters, and special interest groups."
                        />
                        <BenefitCard
                            icon={<ShieldCheck className="w-8 h-8 text-indigo-600" />}
                            title="Legal & Welfare Support"
                            description="Receive guidance and support on professional indemnity, labor rights, and workplace welfare issues."
                        />
                        <BenefitCard
                            icon={<Globe className="w-8 h-8 text-purple-600" />}
                            title="Global Representation"
                            description="Be part of the International Council of Nurses (ICN) through NNAK, giving you a voice on the global stage."
                        />
                        <BenefitCard
                            icon={<Layers className="w-8 h-8 text-amber-600" />}
                            title="Career Resources"
                            description="Access job boards, career counseling, and mentorship programs designed to accelerate your professional growth."
                        />
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

const BenefitCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
);

export default BenefitsPage;
