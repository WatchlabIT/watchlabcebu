import React from 'react';
import { MapPin, CheckCircle2, MessageSquare, Instagram, Facebook } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { getWhatsAppUrl, getMessengerUrl } from '../utils/format';

export default function AboutPage() {
  const highlights = [
    "Cebu’s Trusted Watch Dealer",
    "DTI Registered",
    "300 + Watches Sold",
    "Guaranteed 100% Authentic",
    "Warranty Included"
  ];

  return (
    <div className="page-fade-in" style={{ padding: '80px 0 100px', background: '#FAFAFA' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        
        {/* Header */}
        <ScrollReveal animation="up">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              About Watch Lab Cebu
            </h1>
            <div style={{ width: '40px', height: '2px', background: 'var(--maroon-primary)', margin: '0 auto' }} />
          </div>
        </ScrollReveal>

        {/* Minimal Content Card */}
        <ScrollReveal animation="zoom" delay={120}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          
          {/* Key Highlights */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '40px',
            paddingBottom: '32px',
            borderBottom: '1px solid var(--border-glass)'
          }}>
            {highlights.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <CheckCircle2 size={20} color="var(--maroon-primary)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Location & Delivery Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '0.98rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '40px',
            paddingBottom: '32px',
            borderBottom: '1px solid var(--border-glass)'
          }}>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--maroon-primary)" /> We are located at Gorordo Avenue, Cebu City.
            </p>
            <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Meetups available within Cebu City</div>
              <div>• Delivery via Maxim / Angkas</div>
              <div>• Worldwide Shipping via LBC and DHL Express</div>
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0, paddingLeft: '26px' }}>
              Send us a message in advance to schedule a meetup.
            </p>
          </div>

          {/* Meet The Owner */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--maroon-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              MEET THE OWNER
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.7', margin: 0 }}>
              Hi! Im Bea, Founder of Watch Lab Cebu. Message us so we can help you find the right watch for you. Hope we get to meet soon!
            </p>
          </div>

          {/* Contact Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <a
              href={getMessengerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <MessageSquare size={18} /> Chat on Messenger
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <MessageSquare size={18} /> WhatsApp Chat
            </a>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
            <a href="https://www.instagram.com/watchlab_cebu/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Instagram size={16} color="#E4405F" /> Instagram
            </a>
            <a href="https://www.tiktok.com/@watchlab_cebu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#EE1D52' }}>
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 11-5.2-1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V5.9a6.34 6.34 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.05a8.28 8.28 0 005.15 1.78V7.37a4.85 4.85 0 01-1.26-.68z" />
              </svg> TikTok
            </a>
            <a href="https://www.facebook.com/p/Watch-Lab-Cebu-61571550718463/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <Facebook size={16} color="#1877F2" /> Facebook
            </a>
          </div>

        </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
