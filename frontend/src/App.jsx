import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import OrgNavbar from './components/tenant/OrgNavbar'; // Embedded navigation component link
import OrgDashboard from './pages/OrgDashboard';
import OrgAnalytics from './pages/OrgAnalytics';
import OrgProfile from './pages/OrgProfile';
import OrgCreateEvent from './pages/OrgCreateEvent';
import UserNavbar from './components/user/UserNavbar';
import UserExplore from './pages/UserExplore';
import EventBookingDetail from './pages/EventBookingDetail';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';

function getGoogleClientId() {
  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const clientId = typeof rawClientId === 'string' ? rawClientId.trim() : '';
  return clientId || '';
}

function AppContent({ googleClientId }) {
  const { user, initializing } = React.useContext(AuthContext);
  const isAudience = user?.role === 'Customer';

  if (initializing) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 flex items-center justify-center px-4">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 animate-pulse">Verifying Session Coordinates...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#09090b_0%,#09090b_4rem,#ffffff_4rem,#ffffff_100%)] text-zinc-950 flex flex-col font-sans">
      {user && (isAudience ? <UserNavbar /> : <OrgNavbar />)}

      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={isAudience ? '/explore' : '/dashboard'} replace />
              ) : (
                <div className="min-h-[calc(100vh-7rem)] px-4 py-10 flex items-center justify-center">
                  <Login googleClientId={googleClientId} />
                </div>
              )
            }
          />
          {user ? (isAudience ? (
            <>
              <Route path="/explore" element={user ? <UserExplore /> : <Navigate to="/" replace />} />
              <Route path="/booking/:eventId" element={user ? <EventBookingDetail /> : <Navigate to="/" replace />} />
              <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/" replace />} />
              <Route path="/profile" element={user ? <UserProfile /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to={user ? '/explore' : '/'} replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={user ? <OrgDashboard /> : <Navigate to="/" replace />} />
              <Route path="/analytics" element={user ? <OrgAnalytics /> : <Navigate to="/" replace />} />
              <Route path="/profile" element={user ? <OrgProfile /> : <Navigate to="/" replace />} />
              <Route path="/create-event" element={user ? <OrgCreateEvent /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
            </>
          )) : <Route path="*" element={<Navigate to="/" replace />} />}
        </Routes>
      </main>

      <footer className="w-full border-t border-zinc-950 bg-white py-3 text-center select-none">
        <p className="text-[9px] font-black text-zinc-500 tracking-[0.35em] uppercase">&copy; 2026 Showtime Tenant Microservice</p>
      </footer>
    </div>
  );
}

function App() {
  const googleClientId = getGoogleClientId();
  const appTree = (
    <AuthProvider>
      <BrowserRouter>
        <AppContent googleClientId={googleClientId} />
      </BrowserRouter>
    </AuthProvider>
  );
  return googleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider> : appTree;
}

export default App;
