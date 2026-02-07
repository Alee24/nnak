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

/**
 * Sidebar Sub-component for individual navigation items
 * Uses useLocation to manually track isActive for 100% reliability
 */
const NavItem = ({ to, icon: Icon, label, badge, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
        ${isActive
          ? 'text-[#059669] bg-[#059669]/5 shadow-sm ring-1 ring-[#059669]/10'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      <Icon size={14} strokeWidth={isActive ? 3 : 2} />
      <span className="flex-1 tracking-tight">{label}</span>
      {badge && (
        <span className="bg-[#059669] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
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
        fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-14 flex items-center px-5 border-b border-slate-100 mb-4 flex-shrink-0">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black mr-2.5 shadow-md text-xs">
            N
          </div>
          <span className="font-black text-sm tracking-tight text-slate-900 uppercase">NNAK <span className="text-[#059669]">Admin</span></span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2 opacity-70">Main Systems</div>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}

          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-6 mb-2 px-2 opacity-70">Management</div>
          {managementItems.map((item) => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition-all font-black text-xs uppercase tracking-widest">
            <LogOut size={12} strokeWidth={3} /> Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
