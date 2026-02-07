import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Award, BookOpen, Shield } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-lg flex items-center justify-center shadow-lg">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">NNAK <span className="text-emerald-600">Portal</span></span>
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Benefits</a>
                            <a href="#stats" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Stats</a>
                            <a href="#contact" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Contact</a>
                            <Link
                                to="/login"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Member Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-emerald-50/50"></div>
                    {/* Abstract blobs */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-emerald-100/40 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-3xl opacity-50"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm mb-8 animate-fade-in-up">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-sm font-semibold text-emerald-800 tracking-wide uppercase">Official Membership Portal</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                            Empowering Nursing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Excellence in Kenya</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Join the National Nurses Association of Kenya. Manage your professional profile, track CPD points, and access career-defining opportunities in one unified platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 gap-2 group"
                            >
                                Access Portal
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join NNAK?</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover the benefits designed to support your professional journey and growth.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Award className="w-8 h-8 text-emerald-600" />}
                            title="Professional Recognition"
                            description="Gain official recognition and verify your status as a registered nurse or midwife in Kenya."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-teal-600" />}
                            title="CPD Management"
                            description="Easily track and manage your Continuous Professional Development points and certificates."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-blue-600" />}
                            title="Networking Events"
                            description="Access exclusive conferences, workshops, and networking opportunities with peers."
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80')] opacity-10 bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
                        <StatItem value="15k+" label="Active Members" />
                        <StatItem value="500+" label="Training Events" />
                        <StatItem value="47" label="Counties Covered" />
                        <StatItem value="100%" label="Commitment" />
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-emerald-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Advance Your Career?</h2>
                    <p className="text-xl text-gray-600 mb-10">Join thousands of nursing professionals who are shaping the future of healthcare in Kenya.</p>
                    <Link
                        to="/login"
                        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-emerald-600/20 transition-all transform hover:-translate-y-1"
                    >
                        Register Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} National Nurses Association of Kenya. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-emerald-600 transition-colors">Contact Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const StatItem = ({ value, label }) => (
    <div className="p-6">
        <div className="text-4xl font-extrabold text-emerald-400 mb-2">{value}</div>
        <div className="text-gray-400 font-medium uppercase tracking-wide text-sm">{label}</div>
    </div>
);

export default LandingPage;
