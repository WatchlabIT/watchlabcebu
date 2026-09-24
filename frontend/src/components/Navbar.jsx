import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WatchLabLogo from './WatchLabLogo';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  const closeMobileMenu = () => {
    if (!mobileOpen || isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const toggleMobileMenu = () => {
    if (mobileOpen) {
      closeMobileMenu();
    } else {
      setIsClosing(false);
      setMobileOpen(true);
    }
  };

  const handleNavClick = (path) => {
    closeMobileMenu();
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
      background: 'linear-gradient(135deg, rgba(74, 9, 9, 0.96) 0%, rgba(120, 16, 16, 0.94) 50%, rgba(55, 6, 6, 0.98) 100%)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(40, 5, 5, 0.35)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      transition: 'all 0.3s ease'
    }}>
      {/* Animated Light Beam Accent Bar */}
      <div className="nav-shimmer-line" />

      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Brand Logo */}
        <Link to="/" className="brand-logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <WatchLabLogo size={44} style={{
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          </div>
          <div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '0.8px',
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              WATCH LAB
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '3px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginTop: '-3px'
            }}>
              CEBU • PHILIPPINES
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', gap: '10px', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`nav-pill-item ${active ? 'active' : ''}`}
                style={{
                  textDecoration: 'none',
                  color: '#FFFFFF',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.92rem',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: active
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 100%)'
                    : 'transparent',
                  border: active ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
                  boxShadow: active ? '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)' : 'none',
                  backdropFilter: active ? 'blur(8px)' : 'none'
                }}
              >
                {active && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#FFD700',
                    boxShadow: '0 0 8px #FFD700',
                    display: 'inline-block'
                  }} />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/admin/dashboard" className="btn" style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <LayoutDashboard size={15} /> Admin Portal
              </Link>
              <button
                onClick={logout}
                className="btn"
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
                title="Log out admin session"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className="mobile-toggle mobile-toggle-btn"
            style={{
              background: (mobileOpen && !isClosing) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: (mobileOpen && !isClosing) ? 'rotate(180deg)' : 'rotate(0deg)',
              boxShadow: (mobileOpen && !isClosing) ? '0 0 12px rgba(255, 255, 255, 0.4)' : 'none'
            }}
          >
            {(mobileOpen && !isClosing) ? <X size={24} color="#FFFFFF" /> : <Menu size={24} color="#FFFFFF" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Overlay Backdrop */}
      {mobileOpen && (
        <>
          {/* Semi-transparent Backdrop Overlay */}
          <div
            onClick={closeMobileMenu}
            style={{
              position: 'fixed',
              top: '72px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 998,
              animation: isClosing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.25s ease'
            }}
          />

          {/* Right-to-Left / Left-to-Right Sliding Side Drawer */}
          <div
            className="mobile-side-drawer"
            style={{
              position: 'fixed',
              top: '72px',
              right: 0,
              width: '85vw',
              maxWidth: '340px',
              height: 'calc(100vh - 72px)',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: '-12px 0 35px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              gap: '14px',
              zIndex: 999,
              animation: isClosing
                ? 'slideDrawerOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                : 'slideDrawerInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  style={{
                    textDecoration: 'none',
                    color: active ? 'var(--maroon-primary)' : 'var(--text-primary)',
                    fontSize: '1.1rem',
                    fontWeight: active ? 700 : 600,
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: active ? 'rgba(127, 29, 29, 0.08)' : '#F9FAFB',
                    border: active ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{link.name}</span>
                  {active && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--maroon-primary)' }} />}
                </Link>
              );
            })}
            {isAuthenticated && (
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/admin/dashboard" onClick={closeMobileMenu} className="btn btn-maroon">
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>
                <button onClick={() => { logout(); closeMobileMenu(); }} className="btn btn-secondary">
                  <LogOut size={18} /> Logout Admin Account
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Header CSS Animations & Hover FX */}
      <style>{`
        .nav-shimmer-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 215, 0, 0.2) 20%, 
            rgba(255, 255, 255, 0.85) 50%, 
            rgba(255, 215, 0, 0.2) 80%, 
            transparent 100%
          );
          background-size: 200% 100%;
          animation: navShimmer 4s infinite linear;
          pointer-events: none;
        }

        @keyframes navShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes slideDrawerInRight {
          from {
            transform: translateX(100%);
            opacity: 0.3;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideDrawerOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        .mobile-toggle-btn {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.25s ease, border-color 0.25s ease !important;
        }

        .mobile-toggle-btn:active {
          transform: scale(0.9) !important;
        }

        .nav-pill-item:hover {
          background: rgba(255, 255, 255, 0.16) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-1px);
        }

        .brand-logo-link:hover img, .brand-logo-link:hover svg {
          transform: scale(1.06);
        }

        @media (min-width: 868px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
