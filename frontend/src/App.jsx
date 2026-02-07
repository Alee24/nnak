import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Analytics from './pages/Analytics';
import ProjectDashboard from './pages/ProjectDashboard';

// Placeholder components for routes we haven't implemented yet
const Placeholder = ({ title }) => (
  <div className="p-8 text-center text-gray-500">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import Events from './pages/Events';
import CPDPoints from './pages/CPDPoints';
import Applications from './pages/Applications';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<ProjectDashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberProfile />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="transactions" element={<Placeholder title="Transactions" />} />
          <Route path="events" element={<Events />} />
          <Route path="cpd-points" element={<CPDPoints />} />
          <Route path="applications" element={<Applications />} />
          <Route path="generate-ids" element={<Placeholder title="Generate IDs" />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
