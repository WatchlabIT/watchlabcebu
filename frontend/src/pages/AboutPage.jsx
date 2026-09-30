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
    <div className="page-fade-in" style={{ padding: '24px 0 80px', background: '#FAFAFA' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        
        {/* Header */}
        <ScrollReveal animation="up">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="font-serif gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px' }}>
              About Watch Lab Cebu
            </h1>
            <div style={{ width: '40px', height: '3px', background: 'var(--maroon-primary)', margin: '0 auto', borderRadius: '2px' }} />
          </div>
        </ScrollReveal>

        {/* Side-by-Side Section: Owner Photo & Maroon Info Card */}
        <ScrollReveal animation="zoom" delay={120}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'stretch'
          }}>
            {/* Left: Owner Photo */}
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 12px 35px rgba(127, 29, 29, 0.12)',
              background: '#000',
              minHeight: '480px'
            }}>
              <img
                src="/owner-bea.jpg"
                alt="Bea - Founder of Watch Lab Cebu"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Right: Owner Highlights, Location & Contact Card (Maroon Theme) */}
            <div style={{
              background: 'var(--maroon-gradient)',
              color: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 36px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 16px 40px rgba(127, 29, 29, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px'
            }}>
              {/* Key Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {highlights.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
                    <CheckCircle2 size={18} color="#FFFFFF" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Location & Delivery Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.5' }}>
                <p style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.98rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#FFFFFF" /> We are located at Gorordo Avenue, Cebu City.
                </p>
                <div style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div>• Meetups available within Cebu City</div>
                  <div>• Delivery via Maxim / Angkas</div>
                  <div>• Worldwide Shipping via LBC and DHL Express</div>
                </div>
                <p style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px', marginBottom: 0, paddingLeft: '26px', fontSize: '0.82rem' }}>
                  Send us a message in advance to schedule a meetup.
                </p>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Meet The Owner Context */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  MEET THE OWNER
                </div>
                <p style={{ fontSize: '0.95rem', color: '#FFFFFF', lineHeight: '1.6', margin: 0 }}>
                  Hi! I'm Bea, Founder of Watch Lab Cebu. Message us so we can help you find the right watch for you. Hope we get to meet soon!
                </p>
              </div>

              {/* Contact Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '2px' }}>
                <a
                  href={getMessengerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  <MessageSquare size={16} /> Chat on Messenger
                </a>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  <MessageSquare size={16} /> WhatsApp Chat
                </a>
              </div>

              {/* Social Links */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <a href="https://www.instagram.com/watchlab_cebu/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.95)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Instagram size={15} color="#FFFFFF" /> Instagram
                </a>
                <a href="https://www.tiktok.com/@watchlab_cebu" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.95)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 11-5.2-1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V5.9a6.34 6.34 0 00-1-.08 6.34 6.34 0 106.34 6.34V9.05a8.28 8.28 0 005.15 1.78V7.37a4.85 4.85 0 01-1.26-.68z" />
                  </svg> TikTok
                </a>
                <a href="https://www.facebook.com/p/Watch-Lab-Cebu-61571550718463/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.95)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Facebook size={15} color="#FFFFFF" /> Facebook
                </a>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
