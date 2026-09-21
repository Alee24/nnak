import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import MemberDashboard from './pages/MemberDashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Analytics from './pages/Analytics';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import Events from './pages/Events';
import CPDPoints from './pages/CPDPoints';
import Applications from './pages/Applications';
import BenefitsPage from './pages/BenefitsPage';
import StatsPage from './pages/StatsPage';
import ContactPage from './pages/ContactPage';
import VerifyMemberPage from './pages/VerifyMemberPage';
import MessagesPage from './pages/MessagesPage';
import FAQ from './pages/FAQ';
import TransactionsPage from './pages/TransactionsPage';
import GenerateIDs from './pages/GenerateIDs';

// MMS Golf Club Pages
import InvoicesPage from './pages/InvoicesPage';
import TeeTimesPage from './pages/TeeTimesPage';
import CompetitionsPage from './pages/CompetitionsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CheckInPage from './pages/CheckInPage';
import GuestsPage from './pages/GuestsPage';
import CoursesPage from './pages/CoursesPage';
import MemberStatementPage from './pages/MemberStatementPage';
import FinancePage from './pages/FinancePage';
import FacilitiesPage from './pages/FacilitiesPage';
import ScorecardsPage from './pages/ScorecardsPage';
import HandicapPage from './pages/HandicapPage';

// Dashboard Switcher based on role
const DashboardSwitcher = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (['admin', 'super_admin', 'general_manager'].includes(user?.role)) {
      return <Dashboard />;
    }
    return <MemberDashboard />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

const AdminRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (['admin', 'super_admin', 'general_manager'].includes(user?.role)) {
      return children;
    }
    return <Navigate to="/dashboard" replace />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/verify" element={<VerifyMemberPage />} />
        <Route path="/verify/:id" element={<VerifyMemberPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardSwitcher />} />
          <Route path="members" element={<AdminRoute><Members /></AdminRoute>} />
          <Route path="members/:id" element={<AdminRoute><MemberProfile /></AdminRoute>} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="events" element={<Events />} />
          <Route path="cpd-points" element={<CPDPoints />} />
          <Route path="applications" element={<AdminRoute><Applications /></AdminRoute>} />
          <Route path="generate-ids" element={<AdminRoute><GenerateIDs /></AdminRoute>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="messages" element={<AdminRoute><MessagesPage /></AdminRoute>} />

          {/* MMS Golf Routes */}
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="tee-times" element={<TeeTimesPage />} />
          <Route path="competitions" element={<CompetitionsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="check-in" element={<CheckInPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="courses" element={<AdminRoute><CoursesPage /></AdminRoute>} />
          <Route path="statements" element={<MemberStatementPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="scorecards" element={<ScorecardsPage />} />
          <Route path="handicaps" element={<HandicapPage />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
