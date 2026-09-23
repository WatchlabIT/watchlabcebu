import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, MessageSquare, Sparkles, Clock } from 'lucide-react';
import WatchCard from '../components/WatchCard';
import ProtectedImage from '../components/ProtectedImage';
import { fetchNewArrivals } from '../utils/api';
import { getWhatsAppUrl } from '../utils/format';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNewArrivals(4);
        setNewArrivals(data.watches || []);
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '100px 0 80px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.1) 0%, rgba(248, 249, 250, 1) 70%)'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
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
                marginBottom: '24px'
              }}>
                <Sparkles size={16} /> Trusted Watch Dealer • Cebu based
              </div>

              <h1 className="font-serif gradient-text" style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                lineHeight: '1.15',
                marginBottom: '20px',
                letterSpacing: '-0.5px'
              }}>
                Timeless Elegance. <br />
                Your Everyday Watch.
              </h1>

              <p style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '36px',
                maxWidth: '540px',
                whiteSpace: 'pre-line'
              }}>
                Watch Lab Cebu offers an exclusive selection of authentic timepieces, carefully selected for everyday wear from Pre-Owned to Brand New watches that suit your style.
              </p>

              {/* Call-to-action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <Link to="/collection" className="btn btn-red" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                  View Collection <ArrowRight size={18} />
                </Link>

                <a
                  href="https://www.facebook.com/messages/t/533098296554220"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    padding: '14px 24px',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <MessageSquare size={18} /> Chat on Messenger
                </a>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div style={{ position: 'relative' }}>
              <div className="glass-card" style={{
                padding: '16px',
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden'
              }}>
                <ProtectedImage
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
                  alt="Watch Lab Cebu Featured Rolex Submariner"
                  style={{
                    width: '100%',
                    height: '420px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    display: 'block'
                  }}
                />

                {/* Floating Feature Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '32px',
                  left: '32px',
                  right: '32px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 700, letterSpacing: '1px' }}>
                      FEATURED TIMEPIECE
                    </div>
                    <div className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Rolex Submariner Date
                    </div>
                  </div>
                  <span className="badge badge-brand-new">Brand New</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '48px',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--red-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                FRESH IN STOCK
              </div>
              <h2 className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                New Arrivals
              </h2>
            </div>

            <Link to="/collection" className="btn btn-outline-red">
              View Full Collection <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading new arrivals...
            </div>
          ) : newArrivals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No new arrivals currently listed.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '28px'
            }}>
              {newArrivals.map((watch) => (
                <WatchCard key={watch.id} watch={watch} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CLIENT HANDOVERS / FEATURED TRANSACTIONS SECTION */}
      <section style={{
        padding: '80px 0',
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--maroon-primary)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              WHY CHOOSE WATCH LAB CEBU
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '36px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                CLIENT HANDOVERS
              </div>
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                color: '#FFFFFF',
                padding: '8px 24px',
                borderRadius: '4px',
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                fontWeight: 900,
                letterSpacing: '1px'
              }}>
                FEATURED TRANSACTIONS
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/transactions" style={{
                background: '#F3F4F6',
                border: '1px solid var(--border-glass)',
                borderRadius: '30px',
                padding: '8px 20px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                15 transactions <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Handover Cards Grid (4 Column Layout matching reference screenshot) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Card 1: Meetup in Bohol */}
            <Link to="/transactions" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '130%', background: '#000' }}>
                  <ProtectedImage
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
                    alt="Meetup in Bohol"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 95, 70, 0.95) 0%, rgba(6, 95, 70, 0.85) 75%, transparent 100%)',
                    padding: '16px 14px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-serif)' }}>
                      Meetup in Bohol
                    </h3>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 0', color: '#E2E8F0' }}>
                      6 units Sold! Thank you Maam Mafel.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Ref. SRPD61 */}
            <Link to="/transactions" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '130%', background: '#000' }}>
                  <ProtectedImage
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
                    alt="Ref. SRPD61"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 95, 70, 0.95) 0%, rgba(6, 95, 70, 0.85) 75%, transparent 100%)',
                    padding: '16px 14px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-serif)' }}>
                      Ref. SRPD61
                    </h3>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 0', color: '#E2E8F0' }}>
                      Sold! Thank you Sir Felix.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Delivery via. Maxim */}
            <Link to="/transactions" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '130%', background: '#000' }}>
                  <ProtectedImage
                    src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop"
                    alt="Delivery via Maxim"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 95, 70, 0.95) 0%, rgba(6, 95, 70, 0.85) 75%, transparent 100%)',
                    padding: '16px 14px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-serif)' }}>
                      Delivery via. Maxim
                    </h3>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 0', color: '#E2E8F0' }}>
                      6 units Sold! Thank you Maam Eyay.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 4: Ref. SSK001 */}
            <Link to="/transactions" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ borderRadius: '14px', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '130%', background: '#000' }}>
                  <ProtectedImage
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
                    alt="Ref. SSK001"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(6, 95, 70, 0.95) 0%, rgba(6, 95, 70, 0.85) 75%, transparent 100%)',
                    padding: '16px 14px',
                    color: '#FFFFFF'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF', fontFamily: 'var(--font-serif)' }}>
                      Ref. SSK001
                    </h3>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0 0', color: '#E2E8F0' }}>
                      Brandnew Unit Sold! Thank you Sir.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          {/* 3 Value Pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            marginTop: '40px'
          }}>
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(127, 29, 29, 0.08)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--maroon-primary)'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                100% Authentic Guarantee
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Every timepiece in our catalog is guaranteed 100% authentic. We carefully verify serials, movements, dials, and accompanying paperwork.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--red-primary)'
              }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Curated Luxury Brands
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                From high-complication Swiss icons like Rolex and Omega to everyday luxury Japanese classics like Seiko and Tissot.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--red-primary)'
              }}>
                <Clock size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Direct Customer Support
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Connect directly with the business owner for immediate availability inquiries, price negotiation, and personalized consultations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
