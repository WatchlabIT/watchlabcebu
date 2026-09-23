import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Instagram, Facebook, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/format';
import WatchLabLogo from './WatchLabLogo';

export default function Footer() {
  return (
    <footer style={{
      background: '#FFFFFF',
      borderTop: '2px solid var(--maroon-primary)',
      paddingTop: '64px',
      paddingBottom: '32px',
      marginTop: '80px',
      color: 'var(--text-secondary)',
      boxShadow: '0 -10px 30px rgba(127, 29, 29, 0.04)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Column 1: Brand & Philosophy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <WatchLabLogo size={40} />
              <span className="font-serif gradient-text" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                WATCH LAB CEBU
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Cebu’s premier destination for curated luxury watches. Specializing in Brand New and Pre-Owned high-grade timepieces with guaranteed authenticity.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--maroon-primary)', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Certified Authenticity Guarantee
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.5px' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/collection" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Watch Collection
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>
                  About Watch Lab Cebu
                </Link>
              </li>
              <li>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--maroon-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Contact via WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.5px' }}>
              Contact & Location
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} color="var(--maroon-primary)" />
                <span>Cebu City, Philippines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="var(--maroon-primary)" />
                <span>0943 665 2681</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={18} color="var(--maroon-primary)" />
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--maroon-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  WhatsApp (+639436652681)
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Social Media Presence */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.5px' }}>
              Connect With Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://www.instagram.com/watchlab_cebu/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <Instagram size={18} color="#E4405F" /> Instagram <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a
                href="https://www.tiktok.com/@watchlab_cebu"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#EE1D52' }}>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 11-5.2-1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V5.9a6.34 6.34 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.05a8.28 8.28 0 005.15 1.78V7.37a4.85 4.85 0 01-1.26-.68z" />
                </svg>
                TikTok <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
              <a
                href="https://www.facebook.com/p/Watch-Lab-Cebu-61571550718463/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <Facebook size={18} color="#1877F2" /> Facebook <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-glass)', margin: '32px 0' }} />

        {/* Bottom copyright */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Watch Lab Cebu. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Certified Watch Dealer</span>
            <span>•</span>
            <Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
