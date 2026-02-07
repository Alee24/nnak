import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const LandingNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;
    const linkClass = (path) => `font-medium transition-colors ${isActive(path) ? 'text-emerald-600 font-bold' : 'text-gray-600 hover:text-emerald-600'}`;
    const mobileLinkClass = (path) => `block px-3 py-2 rounded-md text-base font-medium ${isActive(path) ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'}`;

    return (
        <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">NNAK <span className="text-emerald-600">Portal</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className={linkClass('/')}>Home</Link>
                        <Link to="/benefits" className={linkClass('/benefits')}>Benefits</Link>
                        <Link to="/stats" className={linkClass('/stats')}>Stats</Link>
                        <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
                        <Link to="/faq" className={linkClass('/faq')}>FAQ</Link>
                        <Link to="/verify" className={linkClass('/verify')}>Verify Member</Link>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        <Link
                            to="/login"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Member Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 shadow-xl absolute w-full">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className={mobileLinkClass('/')} onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/benefits" className={mobileLinkClass('/benefits')} onClick={() => setIsOpen(false)}>Benefits</Link>
                        <Link to="/stats" className={mobileLinkClass('/stats')} onClick={() => setIsOpen(false)}>Stats</Link>
                        <Link to="/contact" className={mobileLinkClass('/contact')} onClick={() => setIsOpen(false)}>Contact</Link>
                        <Link to="/faq" className={mobileLinkClass('/faq')} onClick={() => setIsOpen(false)}>FAQ</Link>
                        <Link to="/verify" className={mobileLinkClass('/verify')} onClick={() => setIsOpen(false)}>Verify Member</Link>
                        <div className="border-t border-gray-100 my-2 pt-2">
                            <Link
                                to="/login"
                                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Member Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
