import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

// Dynamic lazy imports for instant initial page loading & route splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const Members = lazy(() => import('./pages/Members'));
const MemberProfile = lazy(() => import('./pages/MemberProfile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const Events = lazy(() => import('./pages/Events'));
const CPDPoints = lazy(() => import('./pages/CPDPoints'));
const Applications = lazy(() => import('./pages/Applications'));
const BenefitsPage = lazy(() => import('./pages/BenefitsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const VerifyMemberPage = lazy(() => import('./pages/VerifyMemberPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const GenerateIDs = lazy(() => import('./pages/GenerateIDs'));

// MMS Golf Club Pages
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const TeeTimesPage = lazy(() => import('./pages/TeeTimesPage'));
const CompetitionsPage = lazy(() => import('./pages/CompetitionsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const GuestsPage = lazy(() => import('./pages/GuestsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const MemberStatementPage = lazy(() => import('./pages/MemberStatementPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const FacilitiesPage = lazy(() => import('./pages/FacilitiesPage'));
const ScorecardsPage = lazy(() => import('./pages/ScorecardsPage'));
const HandicapPage = lazy(() => import('./pages/HandicapPage'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'));
const GolfShopPage = lazy(() => import('./pages/GolfShopPage'));
const CaddiesPage = lazy(() => import('./pages/CaddiesPage'));
const GolfCartsPage = lazy(() => import('./pages/GolfCartsPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const GeneralManagerDashboard = lazy(() => import('./pages/GeneralManagerDashboard'));
const FinanceDashboard = lazy(() => import('./pages/FinanceDashboard'));
const GolfProDashboard = lazy(() => import('./pages/GolfProDashboard'));
const CashierDashboard = lazy(() => import('./pages/CashierDashboard'));
const ReceptionistDashboard = lazy(() => import('./pages/ReceptionistDashboard'));

const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading module...</span>
    </div>
  </div>
);

// Dashboard Switcher based on role
const DashboardSwitcher = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role;
    if (['admin', 'super_admin'].includes(role)) return <Dashboard />;
    if (role === 'general_manager') return <GeneralManagerDashboard />;
    if (role === 'finance_manager') return <FinanceDashboard />;
    if (role === 'golf_professional') return <GolfProDashboard />;
    if (role === 'cashier') return <CashierDashboard />;
    if (role === 'receptionist') return <ReceptionistDashboard />;
    if (role === 'member') return <MemberDashboard />;
    return <Dashboard />;
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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="restaurant" element={<RestaurantPage />} />
            <Route path="golf-shop" element={<GolfShopPage />} />
            <Route path="caddies" element={<CaddiesPage />} />
            <Route path="golf-carts" element={<GolfCartsPage />} />
            <Route path="assets" element={<AdminRoute><AssetsPage /></AdminRoute>} />
            <Route path="suppliers" element={<AdminRoute><SuppliersPage /></AdminRoute>} />
            <Route path="staff" element={<AdminRoute><StaffPage /></AdminRoute>} />
          </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
