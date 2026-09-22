import React from 'react';
import { ShieldCheck, Award, MessageSquare, Instagram, Facebook, CheckCircle2, Sparkles } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/format';

export default function AboutPage() {
  return (
    <div style={{ padding: '60px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--red-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <Sparkles size={16} /> Certified Watch Dealer
          </div>
          <h1 className="font-serif gradient-text" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '20px' }}>
            About Watch Lab Cebu
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
            Watch Lab Cebu is a premier watch destination based in Cebu City, Philippines. We are dedicated to providing horological enthusiasts with certified luxury timepieces and personalized inquiry support.
          </p>
        </div>

        {/* Story & Philosophy Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          marginBottom: '64px'
        }}>
          {/* Brand Story */}
          <div className="glass-card" style={{ padding: '36px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--red-primary)', marginBottom: '16px' }}>
              Our Story & Specialization
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              Founded with a passion for fine horology, Watch Lab Cebu bridges watch lovers with pristine Brand New and Pre-Owned watches from the world's most prestigious manufactures.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              We specialize in iconic Swiss sports watches, luxury dress timepieces, and highly sought-after Japanese automatic models. Whether you are looking for your first luxury watch or expanding a collection, Watch Lab Cebu offers curated options.
            </p>
          </div>

          {/* Certification & Authenticity */}
          <div className="glass-card" style={{ padding: '36px' }}>
            <h2 className="font-serif" style={{ fontSize: '1.6rem', color: 'var(--red-primary)', marginBottom: '16px' }}>
              Seller Certification & Authenticity
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={20} color="var(--red-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Authenticity Verified:</strong> Every watch is inspected for authentic components, matching serial numbers, and paper provenance.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={20} color="var(--red-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Condition Integrity:</strong> We clearly demarcate whether a watch is Brand New or Pre-Owned with detailed descriptions.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={20} color="var(--red-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Personalized Consultations:</strong> Speak directly with the owner to answer all technical questions or schedule viewings.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Contact & Social Links Section */}
        <div className="glass-card" style={{ padding: '48px', background: '#FFFFFF' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <h2 className="font-serif" style={{ fontSize: '2rem', marginBottom: '12px' }}>
              Connect & Inquire With Watch Lab Cebu
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Reach out through WhatsApp or follow our official social channels to view new inventory drops and updates.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '16px', borderRadius: '16px', flexDirection: 'column', gap: '6px' }}
            >
              <MessageSquare size={24} />
              <span style={{ fontWeight: 700 }}>WhatsApp Chat</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>0943 665 2681</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/watchlab_cebu/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '16px', borderRadius: '16px', flexDirection: 'column', gap: '6px', border: '1px solid rgba(228, 64, 95, 0.4)' }}
            >
              <Instagram size={24} color="#E4405F" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Instagram</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@watchlab_cebu</span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@watchlab_cebu"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '16px', borderRadius: '16px', flexDirection: 'column', gap: '6px', border: '1px solid rgba(238, 29, 82, 0.4)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#EE1D52' }}>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 11-5.2-1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V5.9a6.34 6.34 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.05a8.28 8.28 0 005.15 1.78V7.37a4.85 4.85 0 01-1.26-.68z" />
              </svg>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>TikTok</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@watchlab_cebu</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/p/Watch-Lab-Cebu-61571550718463/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '16px', borderRadius: '16px', flexDirection: 'column', gap: '6px', border: '1px solid rgba(24, 119, 242, 0.4)' }}
            >
              <Facebook size={24} color="#1877F2" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Facebook Page</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Watch Lab Cebu</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
