import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import WatchDetailPage from './pages/WatchDetailPage';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminWatchFormPage from './pages/AdminWatchFormPage';

// Protected Route Guard for Admin pages
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
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
            <Route path="/watch/:id" element={<WatchDetailPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
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
