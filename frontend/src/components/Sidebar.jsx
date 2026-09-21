import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Users, BarChart2, CreditCard, Calendar, Award,
  FileCheck, Wand2, Settings, LogOut, Mail, Flag, Clock,
  Trophy, Target, UserCheck, ShoppingBag, Coffee, Truck,
  Wrench, Package, Briefcase, Bell, FileText, HardDrive,
  ChevronDown, ChevronRight, DollarSign, UserPlus, Map, Car
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import { useTheme } from '../context/ThemeContext';

const NavItem = ({ to, icon: Icon, label, badge, onClick, theme }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 text-[10px] font-black rounded-xl transition-all duration-200 group relative
        ${isActive
          ? (theme === 'dark'
            ? 'text-white bg-emerald-600 shadow-lg shadow-emerald-600/20'
            : 'text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-100')
          : (theme === 'dark'
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50')}
      `}
    >
      <Icon size={14} strokeWidth={isActive ? 3 : 2} className={`
        flex-shrink-0
        ${isActive
          ? (theme === 'dark' ? 'text-white' : 'text-emerald-600')
          : (theme === 'dark' ? 'text-slate-500 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600')}
        transition-colors
      `} />
      <span className="flex-1 tracking-wider uppercase truncate">{label}</span>
      {badge && (
        <span className={`
          ${isActive
            ? (theme === 'dark' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white')
            : 'bg-emerald-500 text-white'}
          text-[8px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center shadow-sm flex-shrink-0
        `}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const NavGroup = ({ label, children, theme, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] mb-1 rounded-lg transition-colors
          ${theme === 'dark' ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <span>{label}</span>
        {isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>
      {isOpen && <div className="space-y-0.5 mb-2">{children}</div>}
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchCounts();
    const handleUpdate = () => fetchCounts();
    window.addEventListener('membership-updated', handleUpdate);
    window.addEventListener('messages-updated', handleUpdate);
    const interval = setInterval(fetchCounts, 60000);
    return () => {
      window.removeEventListener('membership-updated', handleUpdate);
      window.removeEventListener('messages-updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const [pendingRes, messagesRes] = await Promise.all([
        AdminAPI.getPendingCount().catch(() => ({ count: 0 })),
        AdminAPI.getUnreadMessagesCount().catch(() => ({ count: 0 }))
      ]);
      if (pendingRes.count !== undefined) setPendingCount(pendingRes.count);
      if (messagesRes.count !== undefined) setUnreadMessages(messagesRes.count);
    } catch (error) {
      console.error('Failed to fetch sidebar counts:', error);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to end your session?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        AdminAPI.logout().catch(() => {});
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
  };

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role || 'member';
  const isAdmin = ['admin', 'super_admin', 'general_manager'].includes(role);
  const isFinance = ['admin', 'super_admin', 'general_manager', 'finance_manager', 'cashier'].includes(role);
  const isGolf = ['admin', 'super_admin', 'general_manager', 'golf_manager', 'golf_professional', 'receptionist'].includes(role);
  const isMember = role === 'member';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-56 flex flex-col z-50 transition-all duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'dark'
          ? 'bg-[#0f172a] border-r border-white/5 shadow-2xl'
          : 'bg-white border-r border-slate-200 shadow-sm'}
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 flex-shrink-0 border-b border-slate-100 dark:border-white/5">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black mr-2.5 shadow-lg shadow-emerald-500/20 text-xs">
            MMS
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-[11px] tracking-tight uppercase leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Golf Club <span className="text-emerald-500">MMS</span>
            </span>
            <span className={`text-[7px] uppercase tracking-[0.3em] font-black mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Management Suite
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto custom-scrollbar text-[10px]">
          {/* Main */}
          <NavGroup label="Main" theme={theme} defaultOpen={true}>
            <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" onClick={onClose} theme={theme} />
            {isAdmin && <NavItem to="/dashboard/members" icon={Users} label="Members" onClick={onClose} theme={theme} />}
            {isAdmin && <NavItem to="/dashboard/analytics" icon={BarChart2} label="Analytics" onClick={onClose} theme={theme} />}
            {isMember && <NavItem to="/dashboard/profile" icon={Users} label="My Profile" onClick={onClose} theme={theme} />}
          </NavGroup>

          {/* Golf Operations */}
          <NavGroup label="Golf" theme={theme} defaultOpen={isGolf}>
            <NavItem to="/dashboard/tee-times" icon={Clock} label="Tee Times" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/competitions" icon={Trophy} label="Competitions" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/leaderboard" icon={Target} label="Leaderboard" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/scorecards" icon={FileText} label="Scorecards" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/handicaps" icon={Flag} label="Handicaps" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/check-in" icon={UserCheck} label="Check-In" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/guests" icon={UserPlus} label="Guests" onClick={onClose} theme={theme} />
          </NavGroup>

          {/* Finance */}
          {(isAdmin || isFinance) && (
            <NavGroup label="Finance" theme={theme} defaultOpen={isFinance}>
              <NavItem to="/dashboard/finance" icon={DollarSign} label="Overview" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/invoices" icon={FileText} label="Invoices" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/transactions" icon={CreditCard} label="Payments" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/statements" icon={FileText} label="Statements" onClick={onClose} theme={theme} />
            </NavGroup>
          )}

          {/* Club Services */}
          <NavGroup label="Club Services" theme={theme} defaultOpen={false}>
            <NavItem to="/dashboard/facilities" icon={Map} label="Facilities" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/events" icon={Calendar} label="Events" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/restaurant" icon={Coffee} label="Restaurant" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/golf-shop" icon={ShoppingBag} label="Golf Shop" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/caddies" icon={Users} label="Caddies" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/golf-carts" icon={Car} label="Golf Carts" onClick={onClose} theme={theme} />
          </NavGroup>

          {/* Course & Operations */}
          {isAdmin && (
            <NavGroup label="Operations" theme={theme} defaultOpen={false}>
              <NavItem to="/dashboard/courses" icon={Flag} label="Courses" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/maintenance" icon={Wrench} label="Maintenance" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/assets" icon={HardDrive} label="Assets" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/suppliers" icon={Truck} label="Suppliers" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/staff" icon={Briefcase} label="Staff" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/cpd-points" icon={Award} label="CPD Points" onClick={onClose} theme={theme} />
            </NavGroup>
          )}

          {/* Administration */}
          <NavGroup label="Administration" theme={theme} defaultOpen={false}>
            {isAdmin && <NavItem to="/dashboard/applications" icon={FileCheck} label="Applications" onClick={onClose} theme={theme} badge={pendingCount > 0 ? pendingCount.toString() : null} />}
            {isAdmin && <NavItem to="/dashboard/generate-ids" icon={Wand2} label="Generate IDs" onClick={onClose} theme={theme} />}
            <NavItem to="/dashboard/notifications" icon={Bell} label="Notifications" onClick={onClose} theme={theme} />
            {isAdmin && <NavItem to="/dashboard/messages" icon={Mail} label="Messages" onClick={onClose} theme={theme} badge={unreadMessages > 0 ? unreadMessages.toString() : null} />}
            {(isAdmin || role === 'auditor') && <NavItem to="/dashboard/audit-log" icon={FileCheck} label="Audit Log" onClick={onClose} theme={theme} />}
            <NavItem to="/dashboard/settings" icon={Settings} label="Settings" onClick={onClose} theme={theme} />
          </NavGroup>
        </nav>

        {/* Logout */}
        <div className={`p-3 flex-shrink-0 border-t ${theme === 'dark' ? 'bg-slate-800/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`text-[9px] font-black mb-2 px-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            {user?.first_name} {user?.last_name} • {role?.replace(/_/g, ' ').toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-black text-[9px] uppercase tracking-widest border
              ${theme === 'dark'
                ? 'text-rose-400 border-rose-500/20 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/40'
                : 'text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200'}
            `}
          >
            <LogOut size={12} strokeWidth={3} /> Logout Session
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
