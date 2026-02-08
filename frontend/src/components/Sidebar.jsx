import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  BarChart2,
  CreditCard,
  Calendar,
  Award,
  FileCheck,
  Wand2,
  Settings,
  LogOut,
  Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import { useTheme } from '../context/ThemeContext';

/**
 * Sidebar Sub-component for individual navigation items
 * Uses useLocation to manually track isActive for 100% reliability
 */
const NavItem = ({ to, icon: Icon, label, badge, onClick, theme }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 text-[11px] font-black rounded-xl transition-all duration-300 group relative
        ${isActive
          ? (theme === 'dark'
            ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-600/20'
            : 'text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-100')
          : (theme === 'dark'
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50')}
      `}
    >
      <Icon size={16} strokeWidth={isActive ? 3 : 2} className={`
        ${isActive
          ? (theme === 'dark' ? 'text-white' : 'text-emerald-600')
          : (theme === 'dark' ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600')}
        transition-colors
      `} />
      <span className="flex-1 tracking-wider uppercase">{label}</span>
      {badge && (
        <span className={`
          ${isActive
            ? (theme === 'dark' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white')
            : 'bg-emerald-500 text-white'}
          text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-sm
        `}>
          {badge}
        </span>
      )}
      {isActive && (
        <div className={`absolute right-2 w-1.5 h-1.5 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white' : 'bg-emerald-600'}`}></div>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchCounts();

    const handleUpdate = () => fetchCounts();
    window.addEventListener('membership-updated', handleUpdate);
    // Add listener for message updates if needed
    window.addEventListener('messages-updated', handleUpdate);

    return () => {
      window.removeEventListener('membership-updated', handleUpdate);
      window.removeEventListener('messages-updated', handleUpdate);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const [pendingRes, messagesRes] = await Promise.all([
        AdminAPI.getPendingCount(),
        AdminAPI.getUnreadMessagesCount()
      ]);

      if (pendingRes.count !== undefined) setPendingCount(pendingRes.count);
      if (messagesRes.success) setUnreadMessages(messagesRes.count);

    } catch (error) {
      console.error("Failed to fetch sidebar counts:", error);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle Logout Logic
        window.location.href = '/login';
      }
    });
  };

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const navItems = isAdmin ? [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/dashboard/members', icon: Users, label: 'Members' },
    { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/dashboard/transactions', icon: CreditCard, label: 'Transactions' },
  ] : [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/dashboard/profile', icon: Users, label: 'My Profile' },
    { to: '/dashboard/cpd-points', icon: Award, label: 'CPD Points' },
  ];

  const managementItems = isAdmin ? [
    { to: '/dashboard/events', icon: Calendar, label: 'Events' },
    { to: '/dashboard/cpd-points', icon: Award, label: 'CPD Points' },
    { to: '/dashboard/applications', icon: FileCheck, label: 'Applications', badge: pendingCount > 0 ? pendingCount.toString() : null },
    { to: '/dashboard/generate-ids', icon: Wand2, label: 'Generate IDs' },
    { to: '/dashboard/messages', icon: Mail, label: 'Messages', badge: unreadMessages > 0 ? unreadMessages.toString() : null },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ] : [
    { to: '/dashboard/events', icon: Calendar, label: 'Events' },
    { to: '/dashboard/transactions', icon: CreditCard, label: 'Payments' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-60 flex flex-col z-50 transition-all duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'dark'
          ? 'bg-[#0f172a] border-r border-white/5 shadow-2xl'
          : 'bg-white border-r border-slate-200 shadow-sm'}
      `}>
        <div className="h-16 flex items-center px-6 mb-6 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black mr-3 shadow-lg shadow-emerald-500/20">
            N
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-[13px] tracking-tight uppercase leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              NNAK <span className="text-emerald-500">Admin</span>
            </span>
            <span className={`text-[7px] uppercase tracking-[0.3em] font-black mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Professional Suite
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-4 px-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            Main Systems
          </div>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} theme={theme} />
          ))}

          <div className="pt-8 mb-4">
            <div className={`h-px mx-2 mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
            <div className={`text-[10px] font-black uppercase tracking-[0.25em] mb-4 px-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Management
            </div>
          </div>

          {managementItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} theme={theme} />
          ))}
        </nav>

        <div className={`p-4 flex-shrink-0 border-t ${theme === 'dark' ? 'bg-slate-800/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border
              ${theme === 'dark'
                ? 'text-rose-400 border-rose-500/20 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/40'
                : 'text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200'}
            `}
          >
            <LogOut size={14} strokeWidth={3} /> Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
