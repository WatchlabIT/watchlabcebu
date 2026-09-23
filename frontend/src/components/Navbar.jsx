import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WatchLabLogo from './WatchLabLogo';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Watch Collection', path: '/collection' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'About Watch Lab', path: '/about' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false;
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path) => {
    setMobileOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById('new-arrivals');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('new-arrivals');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--maroon-gradient)',
      boxShadow: '0 4px 20px rgba(69, 10, 10, 0.4)',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WatchLabLogo size={46} style={{ boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.8)', borderRadius: '50%' }} />
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px', color: '#FFFFFF' }}>
              WATCH LAB
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', marginTop: '-3px' }}>
              CEBU • PHILIPPINES
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', gap: '32px', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              style={{
                textDecoration: 'none',
                color: '#FFFFFF',
                opacity: isActive(link.path) ? 1 : 0.85,
                fontWeight: isActive(link.path) ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                padding: '6px 0'
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: '#FFFFFF',
                  borderRadius: '2px'
                }} />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Controls & Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/admin/dashboard" className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.1)' }}>
                <LayoutDashboard size={16} /> Admin Portal
              </Link>
              <button
                onClick={logout}
                className="btn"
                style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#FFFFFF', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                title="Log out admin session"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn" style={{
              color: '#FFFFFF',
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease'
            }}>
              <ShieldCheck size={15} color="#FFFFFF" /> Owner Login
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex'
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? <X size={26} color="#FFFFFF" /> : <Menu size={26} color="#FFFFFF" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          width: '100%',
          height: 'calc(100vh - 80px)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          gap: '24px',
          zIndex: 999
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? 'var(--maroon-primary)' : 'var(--text-primary)',
                fontSize: '1.25rem',
                fontWeight: 600,
                padding: '12px 0',
                borderBottom: '1px solid var(--border-glass)'
              }}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-maroon">
                <LayoutDashboard size={18} /> Admin Dashboard
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-secondary">
                <LogOut size={18} /> Logout Admin Account
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 'auto' }}>
              <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="btn btn-outline-maroon" style={{ width: '100%' }}>
                <ShieldCheck size={18} /> Admin Portal Sign In
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive Inline CSS */}
      <style>{`
        @media (min-width: 868px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
