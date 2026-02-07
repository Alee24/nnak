import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Search, Mail, Bell } from 'lucide-react';

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
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-gray-800">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
                {/* Compact Header */}
                <header className="h-16 flex justify-between items-center px-6 flex-shrink-0 bg-white border-b border-gray-100 z-10 shadow-sm lg:shadow-none">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                        >
                            <Menu size={20} />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight font-dm-sans leading-none">NNAK Dashboard</h1>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Professional Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64 transition focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-400">
                            <Search size={14} className="text-gray-400 mr-2" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-xs w-full text-gray-600 placeholder-gray-400" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-100 transition shadow-sm">
                                <Mail size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 border border-gray-100 transition shadow-sm relative">
                                <Bell size={16} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100 h-6">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <p className="text-[11px] font-bold text-gray-900 leading-none">{user.first_name} {user.last_name}</p>
                                <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider font-bold">Admin</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 flex items-center justify-center font-bold text-[10px] ring-2 ring-white shadow-sm cursor-pointer">
                                {(user.first_name?.[0] || 'A')}{(user.last_name?.[0] || 'U')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area - Added internal scroll */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
