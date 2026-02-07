import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const LandingFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">NNAK Portal</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Empowering nursing professionals across Kenya with a unified platform for registration, licensing, and professional development.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <SocialIcon icon={Facebook} />
                            <SocialIcon icon={Twitter} />
                            <SocialIcon icon={Instagram} />
                            <SocialIcon icon={Linkedin} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Home</Link></li>
                            <li><Link to="/benefits" className="text-gray-500 hover:text-emerald-600 transition-colors">Membership Benefits</Link></li>
                            <li><Link to="/stats" className="text-gray-500 hover:text-emerald-600 transition-colors">Statistics</Link></li>
                            <li><Link to="/verify" className="text-gray-500 hover:text-emerald-600 transition-colors">Verify a Member</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">Constitution</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">Strategic Plan</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">FAQs</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors">Support</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3 text-gray-500">
                                <MapPin size={16} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                                <span>NNAK HQ, Nairobi, Kenya</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Phone size={16} className="text-emerald-600 flex-shrink-0" />
                                <span>+254 700 000 000</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500">
                                <Mail size={16} className="text-emerald-600 flex-shrink-0" />
                                <span>info@nnak.or.ke</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} National Nurses Association of Kenya. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon: Icon }) => (
    <a href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
        <Icon size={16} />
    </a>
);

export default LandingFooter;
