import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MessageSquare, Sparkles, MapPin } from 'lucide-react';
import WatchCard from '../components/WatchCard';
import ProtectedImage from '../components/ProtectedImage';
import ScrollReveal from '../components/ScrollReveal';
import { fetchNewArrivals, fetchWatches, fetchTransactions } from '../utils/api';
import { getImageUrl, getMessengerUrl } from '../utils/format';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredWatch, setFeaturedWatch] = useState(null);
  const [featuredTransactions, setFeaturedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [arrivalsData, allWatchesData, txData] = await Promise.all([
          fetchNewArrivals(4),
          fetchWatches(),
          fetchTransactions()
        ]);
        
        setNewArrivals(arrivalsData.watches || []);

        const watchesList = allWatchesData.watches || [];
        const featured = watchesList.find(w => w.is_featured === true) || watchesList[0] || null;
        setFeaturedWatch(featured);

        const txList = txData.transactions || [];
        setFeaturedTransactions(txList.filter(t => t.is_featured !== false));
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page-fade-in">
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '28px 0 60px',
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
            <ScrollReveal animation="left">
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
                    href={getMessengerUrl()}
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
            </ScrollReveal>

            {/* Right Hero Image Card - Dynamically Changeable Admin Featured Watch */}
            <ScrollReveal animation="right" delay={150}>
              <div style={{ position: 'relative' }}>
                <div className="glass-card" style={{
                  padding: '16px',
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}>
                  <ProtectedImage
                    src={featuredWatch ? getImageUrl(featuredWatch.image_url) : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"}
                    alt={featuredWatch ? featuredWatch.name : "Watch Lab Cebu Featured Timepiece"}
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
                        {featuredWatch ? featuredWatch.name : "Rolex Submariner Date"}
                      </div>
                    </div>
                    {featuredWatch && (
                      <span className={featuredWatch.condition === 'Brand New' ? 'badge badge-brand-new' : 'badge badge-pre-owned'}>
                        {featuredWatch.condition}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" style={{ padding: '80px 0' }}>
        <div className="container">
          <ScrollReveal animation="up">
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
          </ScrollReveal>

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
              {newArrivals.map((watch, index) => (
                <ScrollReveal key={watch.id} animation="up" delay={index * 100}>
                  <WatchCard watch={watch} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED TRANSACTIONS SECTION under "WHY CHOOSE WATCH LAB CEBU" */}
      <section style={{
        padding: '80px 0',
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <ScrollReveal animation="up">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px',
              gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--maroon-primary)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  WHY CHOOSE WATCH LAB CEBU
                </div>
                <h2 className="font-serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Recent Client Transactions & Handovers
                </h2>
              </div>

              <Link to="/transactions" className="btn btn-outline-red">
                View All Transactions <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading featured transactions...
            </div>
          ) : featuredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No transactions currently featured.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px'
            }}>
              {featuredTransactions.slice(0, 3).map((tx, index) => (
                <ScrollReveal key={tx.id} animation="zoom" delay={index * 120}>
                  <div
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '110%',
                      background: '#000',
                      overflow: 'hidden'
                    }}>
                      <ProtectedImage
                        src={getImageUrl(tx.image_url || tx.image)}
                        alt={tx.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {tx.badge || tx.category}
                      </div>

                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '16px 14px',
                        background: 'linear-gradient(to top, rgba(5, 46, 22, 0.95) 0%, rgba(5, 46, 22, 0.85) 70%, transparent 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          lineHeight: '1.2',
                          margin: 0,
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-serif)'
                        }}>
                          {tx.title}
                        </h3>
                        <p style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          margin: 0,
                          color: '#E2E8F0'
                        }}>
                          {tx.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
