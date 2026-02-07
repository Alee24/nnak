
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    LayoutDashboard, Users, CreditCard, Calendar, FileText,
    Settings, LogOut, ChevronRight, Menu, X, Bell, Search, Mail
} from 'lucide-react';

const DashboardLayout = () => {
    const [user, setUser] = React.useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true); // Add explicit loading state

    React.useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                // Redirect if no user found
                window.location.href = '/login';
            } else {
                // Safely parse user data
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) {
                    setUser(parsedUser);
                } else {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error("Auth Error:", error);
            // Clear invalid data and redirect
            localStorage.removeItem('user');
            window.location.href = '/login';
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Application...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash of content

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col overflow-hidden bg-white/50 relative">
                {/* Compact Header - High Density Standardized */}
                <header className="h-14 flex justify-between items-center px-4 flex-shrink-0 bg-white border-b border-slate-100 z-10 shadow-sm lg:shadow-none">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-slate-500 hover:text-slate-700 mr-3"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="hidden sm:block">
                            <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">
                                {user.role === 'admin' || user.role === 'super_admin' ? 'Management Center' : 'Member Portal'}
                            </h1>
                            <p className="text-[8px] text-[#059669] mt-1 uppercase tracking-[0.2em] font-black">
                                {user.role === 'admin' || user.role === 'super_admin' ? 'NNAK Professional Suite' : 'NNAK Member Services'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 w-56 transition-all focus-within:ring-2 focus-within:ring-emerald-500/5 focus-within:bg-white">
                            <Search size={12} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Omni Search..." className="bg-transparent border-none outline-none text-[10px] w-full text-slate-600 font-bold placeholder-slate-300" />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:text-[#059669] transition-all group">
                                <Mail size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all relative group">
                                <Bell size={14} className="group-hover:rotate-12 transition-transform" />
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                            </button>
                        </div>

                        {/* User Profile - Compact */}
                        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-100 h-5">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-[10px] font-black text-slate-900 leading-none">{user.first_name} {user.last_name}</p>
                                <p className="text-[8px] text-[#059669] mt-0.5 uppercase tracking-widest font-black opacity-70">
                                    {user.role === 'admin' || user.role === 'super_admin' ? 'Administrator' : 'Verified Member'}
                                </p>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[9px] shadow-sm cursor-pointer hover:bg-[#059669] transition-colors">
                                {(user.first_name?.[0] || 'A')}{(user.last_name?.[0] || 'U')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area - Reduced Padding */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 lg:p-4">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                    {/* Footer - Compact */}
                    <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center pb-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>&copy; 2024 NNAK SYSTEM</span>
                        <div className="flex items-center gap-1">
                            ENGINEERED BY <a href="https://www.kkdes.co.ke" target="_blank" rel="noopener noreferrer" className="text-[#059669] hover:text-[#047857] transition-colors">KKDES ENGINE</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
