import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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

  const navItems = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/dashboard/members', icon: Users, label: 'Members' },
    { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
    { to: '/dashboard/transactions', icon: CreditCard, label: 'Transactions' },
  ];

  const managementItems = [
    { to: '/dashboard/events', icon: Calendar, label: 'Events' },
    { to: '/dashboard/cpd-points', icon: Award, label: 'CPD Points' },
    { to: '/dashboard/applications', icon: FileCheck, label: 'Applications', badge: pendingCount > 0 ? pendingCount.toString() : null },
    { to: '/dashboard/generate-ids', icon: Wand2, label: 'Generate IDs' },
    { to: '/dashboard/messages', icon: Mail, label: 'Messages', badge: unreadMessages > 0 ? unreadMessages.toString() : null },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const NavItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition
        ${isActive
          ? 'text-[#047857] bg-[#d1fae5] font-bold shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 mb-4 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#059669] to-[#047857] rounded-lg flex items-center justify-center text-white font-bold mr-2.5 shadow-md text-sm">
            N
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 font-dm-sans">NNAK Admin</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-2 opacity-70">Main Menu</div>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-1.5 px-2 opacity-70">Management</div>
          {managementItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg transition font-bold text-xs">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
