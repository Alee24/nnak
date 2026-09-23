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

const NavItem = ({ to, icon: Icon, label, badge, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(`${to}/`));

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded transition-colors group relative
        ${isActive
          ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border-l-2 border-emerald-700 dark:border-emerald-500'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'}
      `}
    >
      <Icon
        size={15}
        strokeWidth={isActive ? 2 : 1.75}
        className={`
          flex-shrink-0 transition-colors
          ${isActive
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}
        `}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={`
          ${isActive
            ? 'bg-emerald-700 text-white'
            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}
          text-[10px] font-bold px-1.5 py-0.2 rounded min-w-[18px] text-center flex-shrink-0
        `}>
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const NavGroup = ({ label, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <span>{label}</span>
        {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {isOpen && <div className="space-y-0.5 mt-1">{children}</div>}
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
      confirmButtonColor: '#047857',
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
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity duration-200 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Enterprise Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-60 flex flex-col z-50 transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800
      `}>
        {/* Brand Header */}
        <div className="h-14 flex items-center px-4 flex-shrink-0 border-b border-slate-200/80 dark:border-slate-800">
          <div className="w-7 h-7 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs mr-2.5 flex-shrink-0">
            <Flag size={14} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs tracking-tight truncate text-slate-900 dark:text-slate-100 leading-tight">
              MMS Golf Club
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto custom-scrollbar space-y-1">
          <NavGroup label="Overview" defaultOpen={true}>
            <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" onClick={onClose} />
            {isAdmin && <NavItem to="/dashboard/members" icon={Users} label="Members Directory" onClick={onClose} />}
            {isAdmin && <NavItem to="/dashboard/analytics" icon={BarChart2} label="Analytics & Reports" onClick={onClose} />}
            {isMember && <NavItem to="/dashboard/profile" icon={Users} label="My Member Profile" onClick={onClose} />}
          </NavGroup>

          <NavGroup label="Golf Operations" defaultOpen={isGolf || true}>
            <NavItem to="/dashboard/tee-times" icon={Clock} label="Tee Times Sheet" onClick={onClose} />
            <NavItem to="/dashboard/competitions" icon={Trophy} label="Competitions" onClick={onClose} />
            <NavItem to="/dashboard/leaderboard" icon={Target} label="Leaderboard" onClick={onClose} />
            <NavItem to="/dashboard/scorecards" icon={FileText} label="Scorecards" onClick={onClose} />
            <NavItem to="/dashboard/handicaps" icon={Flag} label="WHS Handicaps" onClick={onClose} />
            <NavItem to="/dashboard/check-in" icon={UserCheck} label="Golfer Check-In" onClick={onClose} />
            <NavItem to="/dashboard/guests" icon={UserPlus} label="Guests & Green Fees" onClick={onClose} />
          </NavGroup>

          {(isAdmin || isFinance) && (
            <NavGroup label="Finance & Billing" defaultOpen={isFinance}>
              <NavItem to="/dashboard/finance" icon={DollarSign} label="Financial Overview" onClick={onClose} />
              <NavItem to="/dashboard/invoices" icon={FileText} label="Invoices & Dues" onClick={onClose} />
              <NavItem to="/dashboard/transactions" icon={CreditCard} label="Payments & M-Pesa" onClick={onClose} />
              <NavItem to="/dashboard/statements" icon={FileText} label="Member Statements" onClick={onClose} />
            </NavGroup>
          )}

          <NavGroup label="Club Services" defaultOpen={false}>
            <NavItem to="/dashboard/facilities" icon={Map} label="Facilities & Course" onClick={onClose} />
            <NavItem to="/dashboard/events" icon={Calendar} label="Club Events" onClick={onClose} />
            <NavItem to="/dashboard/restaurant" icon={Coffee} label="Dining & Bar" onClick={onClose} />
            <NavItem to="/dashboard/golf-shop" icon={ShoppingBag} label="Pro Shop POS" onClick={onClose} />
            <NavItem to="/dashboard/caddies" icon={Users} label="Caddie Master" onClick={onClose} />
            <NavItem to="/dashboard/golf-carts" icon={Car} label="Golf Carts" onClick={onClose} />
          </NavGroup>

          {isAdmin && (
            <NavGroup label="Operations & Assets" defaultOpen={false}>
              <NavItem to="/dashboard/courses" icon={Flag} label="Course Setup" onClick={onClose} />
              <NavItem to="/dashboard/maintenance" icon={Wrench} label="Greenkeeping" onClick={onClose} />
              <NavItem to="/dashboard/assets" icon={HardDrive} label="Equipment & Assets" onClick={onClose} />
              <NavItem to="/dashboard/suppliers" icon={Truck} label="Suppliers" onClick={onClose} />
              <NavItem to="/dashboard/staff" icon={Briefcase} label="Club Staff" onClick={onClose} />
              <NavItem to="/dashboard/cpd-points" icon={Award} label="CPD Points" onClick={onClose} />
            </NavGroup>
          )}

          <NavGroup label="Administration" defaultOpen={false}>
            {isAdmin && (
              <NavItem
                to="/dashboard/applications"
                icon={FileCheck}
                label="Applications"
                onClick={onClose}
                badge={pendingCount > 0 ? pendingCount.toString() : null}
              />
            )}
            {isAdmin && <NavItem to="/dashboard/generate-ids" icon={Wand2} label="Membership Cards" onClick={onClose} />}
            <NavItem to="/dashboard/notifications" icon={Bell} label="Notices & Bulletins" onClick={onClose} />
            {isAdmin && (
              <NavItem
                to="/dashboard/messages"
                icon={Mail}
                label="Inquiries"
                onClick={onClose}
                badge={unreadMessages > 0 ? unreadMessages.toString() : null}
              />
            )}
            {(isAdmin || role === 'auditor') && <NavItem to="/dashboard/audit-log" icon={ShieldAlert} label="Security Audit" onClick={onClose} />}
            <NavItem to="/dashboard/settings" icon={Settings} label="System Settings" onClick={onClose} />
          </NavGroup>
        </nav>

        {/* User Session Footer */}
        <div className="p-3 flex-shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">
                {role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded transition-colors text-xs font-semibold border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <LogOut size={13} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
