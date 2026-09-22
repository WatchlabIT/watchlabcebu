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
    { name: 'New Arrivals', path: '/#new-arrivals' },
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
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      borderBottom: '2px solid var(--red-primary)',
      boxShadow: '0 4px 20px rgba(220, 38, 38, 0.08)',
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
          <WatchLabLogo size={46} />
          <div>
            <div className="font-serif gradient-text" style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              WATCH LAB
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--red-primary)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', marginTop: '-3px' }}>
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
                color: isActive(link.path) ? 'var(--red-primary)' : 'var(--text-primary)',
                fontWeight: isActive(link.path) ? 700 : 500,
                fontSize: '0.95rem',
                transition: 'color 0.2s ease',
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
                  background: 'var(--red-gradient)',
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
              <Link to="/admin/dashboard" className="btn btn-outline-red" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <LayoutDashboard size={16} /> Admin Portal
              </Link>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                title="Log out admin session"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
              transition: 'color 0.2s ease'
            }}>
              <ShieldCheck size={14} color="var(--red-primary)" /> Owner Login
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex'
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? <X size={26} color="var(--red-primary)" /> : <Menu size={26} />}
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
                color: isActive(link.path) ? 'var(--red-primary)' : 'var(--text-primary)',
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
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-red">
                <LayoutDashboard size={18} /> Admin Dashboard
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-secondary">
                <LogOut size={18} /> Logout Admin Account
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 'auto' }}>
              <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="btn btn-outline-red" style={{ width: '100%' }}>
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
