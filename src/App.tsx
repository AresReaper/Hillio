import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home as HomeIcon, QrCode, LayoutDashboard, ScanLine, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import TripDashboard from './pages/TripDashboard';
import JoinTrip from './pages/JoinTrip';
import UserQR from './pages/UserQR';
import Scanner from './pages/Scanner';
import UniversalScanner from './pages/UniversalScanner';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import LandingPage from './showcase/LandingPage';
import ShortLinkRedirect from './pages/ShortLinkRedirect';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { cn } from './lib/utils';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, logout, admin } = useAdminAuth();
  const isTripPage = location.pathname.includes('/trip/') && !location.pathname.includes('/user/') && !location.pathname.includes('/join') && !location.pathname.includes('/scanner');
  const isUserPage = location.pathname.includes('/user/') || location.pathname.includes('/join');
  const isShowcase = location.pathname === '/showcase';
  const isScannerPage = location.pathname.includes('/scanner') || location.pathname === '/scan';

  // Do not show global navigation heavily inside TripDashboard or Scanner,
  // TripDashboard will render its own custom bottom navigation to handle map viewing.
  if (isTripPage || isUserPage || isShowcase || isScannerPage) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center gap-4 pointer-events-none">
      {/* Global simple nav for non-trip pages if needed, otherwise empty */}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isShowcase = location.pathname === '/showcase';

  return (
    <div className={cn(
      "min-h-screen relative pb-24",
      !isShowcase && "max-w-md mx-auto"
    )}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/s/:shortId" element={<ShortLinkRedirect />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/showcase" element={<LandingPage />} />
          <Route path="/scan" element={<UniversalScanner />} />
          <Route path="/trip/:tripId" element={
            <ProtectedRoute>
              <TripDashboard />
            </ProtectedRoute>
          } />
          <Route path="/trip/:tripId/join" element={<JoinTrip />} />
          <Route path="/trip/:tripId/user/:userId" element={<UserQR />} />
          <Route path="/trip/:tripId/scanner" element={
            <ProtectedRoute>
              <Scanner />
            </ProtectedRoute>
          } />
        </Routes>
      </AnimatePresence>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
