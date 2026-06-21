import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { cn } from './lib/utils';

// Lazy loading heavy routes
const Home = React.lazy(() => import('./pages/Home'));
const TripDashboard = React.lazy(() => import('./pages/TripDashboard'));
const JoinTrip = React.lazy(() => import('./pages/JoinTrip'));
const UserQR = React.lazy(() => import('./pages/UserQR'));
const Scanner = React.lazy(() => import('./pages/Scanner'));
const UniversalScanner = React.lazy(() => import('./pages/UniversalScanner'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const Signup = React.lazy(() => import('./pages/Signup'));
const LandingPage = React.lazy(() => import('./showcase/LandingPage'));
const ShortLinkRedirect = React.lazy(() => import('./pages/ShortLinkRedirect'));
const TrackTrip = React.lazy(() => import('./pages/TrackTrip'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Fallback spinner
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
  </div>
);

function AppRoutes() {
  const location = useLocation();
  
  // Outer routing layer occupies full screen width to ensure backgrounds and gradient effects
  // stretch edge-to-edge. Any structural containment is managed internally by the pages.
  const layoutClass = "min-h-screen w-full relative bg-deep-forest text-slate-100 flex flex-col";

  return (
    <div className={layoutClass}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/s/:shortId" element={<ShortLinkRedirect />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/showcase" element={<LandingPage />} />
          <Route path="/track" element={<TrackTrip />} />
          <Route path="/track/:trackingId" element={<TrackTrip />} />
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
      </Suspense>
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
