import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Flag } from 'lucide-react';

const LandingFooter = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 font-sans text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                                <Flag size={16} className="text-white" />
                            </div>
                            <h3 className="text-lg font-serif font-black tracking-tight">MMS GOLF CLUB</h3>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Premier 18-hole championship golf estate and country club. World Handicap System sanctioned tournaments, junior academy and luxury clubhouse hospitality.
                        </p>
                        <div className="flex space-x-3 pt-2">
                            <SocialIcon icon={Facebook} />
                            <SocialIcon icon={Twitter} />
                            <SocialIcon icon={Instagram} />
                            <SocialIcon icon={Linkedin} />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Golf & Club</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Club Homepage</Link></li>
                            <li><Link to="/benefits" className="hover:text-emerald-400 transition-colors">Membership Categories</Link></li>
                            <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Tee Sheet Portal</Link></li>
                            <li><Link to="/signup" className="hover:text-emerald-400 transition-colors">Membership Application</Link></li>
                        </ul>
                    </div>

                    {/* Facilities */}
                    <div>
                        <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Amenities</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li><span className="hover:text-emerald-400 cursor-pointer">18-Hole Championship Course</span></li>
                            <li><span className="hover:text-emerald-400 cursor-pointer">Driving Range & Academy</span></li>
                            <li><span className="hover:text-emerald-400 cursor-pointer">Fairway Terrace & Dining</span></li>
                            <li><span className="hover:text-emerald-400 cursor-pointer">Olympic Heated Pool & Gym</span></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Clubhouse</h4>
                        <ul className="space-y-2.5 text-xs">
                            <li className="flex items-start gap-2.5">
                                <MapPin size={15} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                                <span>MMS Golf Estate, Nairobi, Kenya</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone size={15} className="text-emerald-500 flex-shrink-0" />
                                <span>+254 700 884 400</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={15} className="text-emerald-500 flex-shrink-0" />
                                <span>info@mmsgolfclub.co.ke</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
                    <p>&copy; {new Date().getFullYear()} MMS Golf Club Management System. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span className="hover:text-emerald-400 cursor-pointer">Course Etiquette & Constitution</span>
                        <span className="hover:text-emerald-400 cursor-pointer">Privacy Policy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon: Icon }) => (
    <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
        <Icon size={14} />
    </a>
);

export default LandingFooter;
