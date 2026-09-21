import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Users, BarChart2, CreditCard, Calendar, Award,
  FileCheck, Wand2, Settings, LogOut, Mail, Flag, Clock,
  Trophy, Target, UserCheck, ShoppingBag, Coffee, Truck,
  Wrench, Briefcase, Bell, FileText, HardDrive,
  ChevronDown, ChevronRight, DollarSign, UserPlus, Map, Car,
  ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import { useTheme } from '../context/ThemeContext';

const NavItem = ({ to, icon: Icon, label, badge, onClick, theme }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(`${to}/`));

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium rounded-lg transition-all duration-150 group relative
        ${isActive
          ? (theme === 'dark'
            ? 'text-emerald-300 bg-emerald-950/50 border-l-2 border-emerald-500 font-semibold shadow-xs'
            : 'text-emerald-900 bg-emerald-50/90 border-l-2 border-emerald-700 font-semibold shadow-xs')
          : (theme === 'dark'
            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70')}
      `}
    >
      <Icon
        size={15}
        strokeWidth={isActive ? 2.2 : 1.75}
        className={`
          flex-shrink-0 transition-colors
          ${isActive
            ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700')
            : (theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700')}
        `}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={`
          ${isActive
            ? 'bg-emerald-700 text-white'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'}
          text-[10px] font-semibold px-1.5 py-0.2 rounded-full min-w-[18px] text-center flex-shrink-0
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
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded transition-colors
          ${theme === 'dark' ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <span>{label}</span>
        {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {isOpen && <div className="space-y-0.5 mt-0.5">{children}</div>}
    </div>
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
      title: 'End Session?',
      text: 'Are you sure you want to log out of MMS?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#065f46',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Sign Out'
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
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-60 flex flex-col z-50 transition-all duration-300 ease-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'dark'
          ? 'bg-slate-900 border-r border-slate-800'
          : 'bg-white border-r border-slate-200/80'}
      `}>
        {/* Brand Crest & Header */}
        <div className="h-16 flex items-center px-4 flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-serif font-bold text-sm shadow-xs border border-emerald-800/40 mr-3 flex-shrink-0">
            <Flag size={14} className="text-emerald-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`font-serif font-bold text-sm tracking-tight truncate leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              MMS Golf Club
            </span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Championship & Links
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar">
          {/* Main */}
          <NavGroup label="Overview" theme={theme} defaultOpen={true}>
            <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" onClick={onClose} theme={theme} />
            {isAdmin && <NavItem to="/dashboard/members" icon={Users} label="Members Directory" onClick={onClose} theme={theme} />}
            {isAdmin && <NavItem to="/dashboard/analytics" icon={BarChart2} label="Analytics" onClick={onClose} theme={theme} />}
            {isMember && <NavItem to="/dashboard/profile" icon={Users} label="My Member Profile" onClick={onClose} theme={theme} />}
          </NavGroup>

          {/* Golf Operations */}
          <NavGroup label="Golf Operations" theme={theme} defaultOpen={isGolf || true}>
            <NavItem to="/dashboard/tee-times" icon={Clock} label="Tee Times" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/competitions" icon={Trophy} label="Competitions" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/leaderboard" icon={Target} label="Leaderboard" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/scorecards" icon={FileText} label="Scorecards" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/handicaps" icon={Flag} label="WHS Handicaps" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/check-in" icon={UserCheck} label="Golfer Check-In" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/guests" icon={UserPlus} label="Guests & Green Fees" onClick={onClose} theme={theme} />
          </NavGroup>

          {/* Finance */}
          {(isAdmin || isFinance) && (
            <NavGroup label="Finance & Billing" theme={theme} defaultOpen={isFinance}>
              <NavItem to="/dashboard/finance" icon={DollarSign} label="Financial Overview" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/invoices" icon={FileText} label="Invoices & Dues" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/transactions" icon={CreditCard} label="Payments & M-Pesa" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/statements" icon={FileText} label="Member Statements" onClick={onClose} theme={theme} />
            </NavGroup>
          )}

          {/* Club Services */}
          <NavGroup label="Club Services" theme={theme} defaultOpen={false}>
            <NavItem to="/dashboard/facilities" icon={Map} label="Facilities & Course" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/events" icon={Calendar} label="Club Events" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/restaurant" icon={Coffee} label="Dining & Bar" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/golf-shop" icon={ShoppingBag} label="Pro Shop" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/caddies" icon={Users} label="Caddie Master" onClick={onClose} theme={theme} />
            <NavItem to="/dashboard/golf-carts" icon={Car} label="Golf Carts" onClick={onClose} theme={theme} />
          </NavGroup>

          {/* Operations & Assets */}
          {isAdmin && (
            <NavGroup label="Operations" theme={theme} defaultOpen={false}>
              <NavItem to="/dashboard/courses" icon={Flag} label="Course Setup" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/maintenance" icon={Wrench} label="Greenkeeping" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/assets" icon={HardDrive} label="Equipment & Assets" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/suppliers" icon={Truck} label="Suppliers" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/staff" icon={Briefcase} label="Club Staff" onClick={onClose} theme={theme} />
              <NavItem to="/dashboard/cpd-points" icon={Award} label="CPD Points" onClick={onClose} theme={theme} />
            </NavGroup>
          )}

          {/* Administration */}
          <NavGroup label="Administration" theme={theme} defaultOpen={false}>
            {isAdmin && (
              <NavItem
                to="/dashboard/applications"
                icon={FileCheck}
                label="Applications"
                onClick={onClose}
                theme={theme}
                badge={pendingCount > 0 ? pendingCount.toString() : null}
              />
            )}
            {isAdmin && <NavItem to="/dashboard/generate-ids" icon={Wand2} label="Membership Cards" onClick={onClose} theme={theme} />}
            <NavItem to="/dashboard/notifications" icon={Bell} label="Notices & Bulletins" onClick={onClose} theme={theme} />
            {isAdmin && (
              <NavItem
                to="/dashboard/messages"
                icon={Mail}
                label="Inquiries"
                onClick={onClose}
                theme={theme}
                badge={unreadMessages > 0 ? unreadMessages.toString() : null}
              />
            )}
            {(isAdmin || role === 'auditor') && <NavItem to="/dashboard/audit-log" icon={ShieldAlert} label="Security & Audit" onClick={onClose} theme={theme} />}
            <NavItem to="/dashboard/settings" icon={Settings} label="Club Settings" onClick={onClose} theme={theme} />
          </NavGroup>
        </nav>

        {/* User Footer & Logout */}
        <div className={`p-3 flex-shrink-0 border-t ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200/80'}`}>
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium truncate">
                {role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-[11px] font-medium border
              ${theme === 'dark'
                ? 'text-rose-400 border-rose-900/40 hover:bg-rose-950/30'
                : 'text-rose-600 border-rose-200/70 hover:bg-rose-50'}
            `}
          >
            <LogOut size={12} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
