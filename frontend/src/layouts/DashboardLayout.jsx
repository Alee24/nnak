
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    LayoutDashboard, Users, CreditCard, Calendar, FileText,
    Settings, LogOut, ChevronRight, Menu, X, Bell, Search, Mail,
    Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = () => {
    const { theme, toggleTheme } = useTheme();
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
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950 relative">
                {/* Refined Luxury Header */}
                <header className="h-16 flex justify-between items-center px-4 lg:px-6 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 z-10 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Open Navigation"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden sm:block">
                            <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                                {user.role === 'admin' || user.role === 'super_admin' ? 'Club Management Suite' : 'Member Services Portal'}
                            </h1>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                MMS Golf Club • Championship & Links
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-1.5 w-64 transition-all focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600">
                            <Search size={14} className="text-slate-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search golfers, flights, tee times..."
                                className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                            </button>
                            <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                                title="Notices"
                            >
                                <Bell size={15} />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                            </button>
                        </div>

                        {/* User Profile Pill */}
                        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                    {user.first_name} {user.last_name}
                                </p>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium capitalize">
                                    {user.role === 'admin' || user.role === 'super_admin' ? 'Club Administrator' : (user.role?.replace(/_/g, ' ') || 'Member')}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center justify-center font-bold text-xs shadow-2xs">
                                {(user.first_name?.[0] || 'M')}{(user.last_name?.[0] || 'C')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                    {/* Footer */}
                    <div className="mt-12 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 pb-6 text-xs text-slate-400 dark:text-slate-500">
                        <span>&copy; {new Date().getFullYear()} MMS Golf Club Management System. All rights reserved.</span>
                        <div className="flex items-center gap-1 font-medium">
                            <span>Powered by</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">MMS Golf Operations Engine</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
