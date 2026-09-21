import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flag, Menu, X, Trophy, Calendar, Users, Shield } from 'lucide-react';

const LandingNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;
    const linkClass = (path) => `font-bold text-xs uppercase tracking-wider transition-colors ${isActive(path) ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`;
    const mobileLinkClass = (path) => `block px-3 py-2 rounded-md text-sm font-bold uppercase ${isActive(path) ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'}`;

    return (
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white font-black text-sm">
                            MMS
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-base text-slate-900 tracking-tight uppercase leading-none">
                                Golf Club <span className="text-emerald-600">MMS</span>
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-slate-400 mt-0.5">
                                Member Management Suite
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-7 items-center">
                        <Link to="/" className={linkClass('/')}>Home</Link>
                        <Link to="/benefits" className={linkClass('/benefits')}>Membership Tiers</Link>
                        <Link to="/stats" className={linkClass('/stats')}>Club Stats</Link>
                        <Link to="/contact" className={linkClass('/contact')}>Contact Club</Link>
                        <Link to="/faq" className={linkClass('/faq')}>Club Rules & FAQ</Link>
                        <Link to="/verify" className={linkClass('/verify')}>Verify Member Card</Link>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <Link
                            to="/login"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-emerald-600/20"
                        >
                            Member Portal
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 shadow-xl absolute w-full px-4 py-4 space-y-2">
                    <Link to="/" className={mobileLinkClass('/')} onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/benefits" className={mobileLinkClass('/benefits')} onClick={() => setIsOpen(false)}>Membership Tiers</Link>
                    <Link to="/stats" className={mobileLinkClass('/stats')} onClick={() => setIsOpen(false)}>Club Stats</Link>
                    <Link to="/contact" className={mobileLinkClass('/contact')} onClick={() => setIsOpen(false)}>Contact Club</Link>
                    <Link to="/faq" className={mobileLinkClass('/faq')} onClick={() => setIsOpen(false)}>FAQ</Link>
                    <Link to="/verify" className={mobileLinkClass('/verify')} onClick={() => setIsOpen(false)}>Verify Member Card</Link>
                    <div className="pt-2 border-t">
                        <Link
                            to="/login"
                            className="block w-full text-center bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase text-xs"
                            onClick={() => setIsOpen(false)}
                        >
                            Member Portal
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
