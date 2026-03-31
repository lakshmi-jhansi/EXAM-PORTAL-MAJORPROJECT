import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import ExamTaking from './pages/ExamTaking';
import Results from './pages/Results';
import ExamHistory from './pages/ExamHistory';
import Profile from './pages/Profile';
import TranslateDocument from './pages/TranslateDocument';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import SessionDetails from './pages/SessionDetails';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access');
  if (loading || (!user && token)) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  // Commented out to allow testing login page directly even if logged in
  // if (user) {
  //   return <Navigate to={user.is_staff ? "/admin" : "/dashboard"} replace />;
  // }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('access');
  if (loading || (!user && token)) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
}

import DashboardLayout from './components/DashboardLayout';
import Chatbot from './components/Chatbot';

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  // Pattern strictly matches /exam/{id} where id is not "setup" and there's no trailing "/results"
  const isTakingExam = /^\/exam\/(?!setup\/?$)[^\/]+$/.test(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* Sidebar Layout Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/exam/setup" element={<ExamSetup />} />
        <Route path="/history" element={<ExamHistory />} />
        <Route path="/history/:sessionId" element={<SessionDetails />} />
        <Route path="/translate" element={<TranslateDocument />} />
        <Route path="/exam/:id/results" element={<Results />} />
      </Route>

      {/* Standalone Admin Route */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* Fullscreen Exam Route */}
      <Route path="/exam/:id" element={<ProtectedRoute><ExamTaking /></ProtectedRoute>} />
      </Routes>
      {!isTakingExam && <Chatbot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
