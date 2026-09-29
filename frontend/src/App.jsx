import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import WatchDetailPage from './pages/WatchDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminWatchFormPage from './pages/AdminWatchFormPage';

// Secret custom URL route for brand owner access only - STRICTLY ONLY THIS LINK
export const OWNER_SECRET_PATH = '/watchlab-portal-bea-cebu-access-x99';

// Protected Route Guard for Admin pages
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div className="spin" style={{ width: '36px', height: '36px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--maroon-primary)', borderRadius: '50%' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Loading Session...</div>
      </div>
    );
  }
  // Redirect unauthenticated attempts to Home page so admin portal URL remains private
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  React.useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.protected-image-container') || e.target.closest('img')) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.protected-image-container')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <main style={{ flexGrow: 1 }}>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/watch/:id" element={<WatchDetailPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Secret Admin Login Route - STRICTLY ONLY accessible via secret link */}
            <Route path={OWNER_SECRET_PATH} element={<AdminLoginPage />} />

            {/* Block generic /admin, /admin/login, /admin-login (redirects to Home Page) */}
            <Route path="/admin/login" element={<Navigate to="/" replace />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/admin-login" element={<Navigate to="/" replace />} />

            {/* Protected Admin Dashboard & Management Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/watches/add"
              element={
                <ProtectedAdminRoute>
                  <AdminWatchFormPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/watches/new"
              element={
                <ProtectedAdminRoute>
                  <AdminWatchFormPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/watches/edit/:id"
              element={
                <ProtectedAdminRoute>
                  <AdminWatchFormPage />
                </ProtectedAdminRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <FloatingWhatsApp />
      </div>
    </AuthProvider>
  );
}
