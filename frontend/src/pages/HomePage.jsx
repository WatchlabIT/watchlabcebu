import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MessageSquare, Sparkles, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import WatchCard from '../components/WatchCard';
import ProtectedImage from '../components/ProtectedImage';
import ScrollReveal from '../components/ScrollReveal';
import { fetchNewArrivals, fetchWatches, fetchTransactions } from '../utils/api';
import { getImageUrl, getMessengerUrl, formatPrice } from '../utils/format';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [heroWatches, setHeroWatches] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredTransactions, setFeaturedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const highlightsScrollRef = useRef(null);
  const txScrollRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [arrivalsData, allWatchesData, txData] = await Promise.all([
          fetchNewArrivals(10),
          fetchWatches(),
          fetchTransactions()
        ]);
        
        setNewArrivals(arrivalsData.watches || []);

        const watchesList = allWatchesData.watches || [];
        const featuredList = watchesList.filter(w => w && (w.is_featured === true || w.is_featured === 'true' || w.is_featured === 'TRUE' || w.is_featured === 1));
        const finalHeroList = featuredList.length > 0 ? featuredList : (watchesList.length > 0 ? [watchesList[0]] : []);
        setHeroWatches(finalHeroList);

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

  // Auto-play timer for Hero Slideshow (cycles every 5s unless hovered)
  useEffect(() => {
    if (heroWatches.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroWatches.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroWatches.length, isPaused]);

  const currentHero = heroWatches[heroIndex] || heroWatches[0] || null;

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

            {/* Right Hero Image Card - Dynamic Hero Slideshow */}
            <ScrollReveal animation="right" delay={150}>
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="glass-card" style={{
                  padding: '16px',
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden'
                }}>
                  {/* Current Active Watch Image */}
                  <div style={{ position: 'relative', height: '420px', borderRadius: '16px', overflow: 'hidden' }}>
                    {currentHero ? (
                      <ProtectedImage
                        key={currentHero.id || heroIndex}
                        src={getImageUrl(currentHero.image_url)}
                        alt={currentHero.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <ProtectedImage
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
                        alt="Watch Lab Cebu Featured Timepiece"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                      />
                    )}

                    {/* Slideshow Arrow Navigation (Show if more than 1 hero watch) */}
                    {heroWatches.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setHeroIndex(prev => (prev - 1 + heroWatches.length) % heroWatches.length);
                          }}
                          aria-label="Previous Slide"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '12px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.88)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setHeroIndex(prev => (prev + 1) % heroWatches.length);
                          }}
                          aria-label="Next Slide"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '12px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.88)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Floating Feature Badge Overlay */}
                  {currentHero && (
                    <div style={{
                      position: 'absolute',
                      bottom: '28px',
                      left: '28px',
                      right: '28px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      zIndex: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--maroon-primary)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          FEATURED TIMEPIECE {heroWatches.length > 1 ? `(${heroIndex + 1}/${heroWatches.length})` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {currentHero.condition && (
                            <span className={currentHero.condition === 'Brand New' ? 'badge badge-brand-new' : 'badge badge-pre-owned'} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                              {currentHero.condition}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <Link to={`/watch/${currentHero.id}`} className="font-serif hover-underline" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', textDecoration: 'none' }}>
                            {currentHero.name}
                          </Link>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--maroon-primary)', marginTop: '2px' }}>
                            {formatPrice(currentHero.price)}
                          </div>
                        </div>

                        <Link
                          to={`/watch/${currentHero.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '8px 14px', flexShrink: 0 }}
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* Pagination Indicator Dots */}
                      {heroWatches.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                          {heroWatches.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setHeroIndex(idx)}
                              aria-label={`Go to slide ${idx + 1}`}
                              style={{
                                width: idx === heroIndex ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                background: idx === heroIndex ? 'var(--maroon-primary)' : '#D1D5DB',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section id="new-arrivals" style={{ padding: '56px 0' }}>
        <div className="container">
          <ScrollReveal animation="up">
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--maroon-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  FRESH IN STOCK
                </div>
                <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  New Arrivals
                </h2>
              </div>

              {/* Controls & Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="mobile-slider-controls" style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => scrollContainer(highlightsScrollRef, 'left')}
                    className="btn btn-secondary"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    aria-label="Previous New Arrival"
                    title="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollContainer(highlightsScrollRef, 'right')}
                    className="btn btn-secondary"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    aria-label="Next New Arrival"
                    title="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <Link to="/collection" className="btn btn-outline-maroon" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  View Collection <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Swipe Hint Label (Mobile only) */}
          <div className="mobile-swipe-hint" style={{ fontSize: '0.78rem', color: 'var(--maroon-primary)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>‹ Slide left & right to browse new arrivals ›</span>
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
            <div
              ref={highlightsScrollRef}
              className="new-arrivals-grid-container"
            >
              {newArrivals.map((watch) => (
                <div
                  key={watch.id}
                  className="new-arrivals-grid-item"
                >
                  <WatchCard watch={watch} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED TRANSACTIONS SECTION (HORIZONTAL SLIDER) */}
      <section style={{
        padding: '56px 0',
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
              marginBottom: '24px',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--maroon-primary)', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  WHY CHOOSE WATCH LAB CEBU
                </div>
                <h2 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Recent Client Transactions & Handovers
                </h2>
              </div>

              {/* Slider Controls & Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => scrollContainer(txScrollRef, 'left')}
                    className="btn btn-secondary"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    aria-label="Previous Transaction"
                    title="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollContainer(txScrollRef, 'right')}
                    className="btn btn-secondary"
                    style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    aria-label="Next Transaction"
                    title="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <Link to="/transactions" className="btn btn-outline-maroon" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                  View All Transactions <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Swipe Hint */}
          <div style={{ fontSize: '0.78rem', color: 'var(--maroon-primary)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>‹ Slide left & right to browse client handovers ›</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading featured transactions...
            </div>
          ) : featuredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No transactions currently featured.
            </div>
          ) : (
            <div
              ref={txScrollRef}
              className="horizontal-watch-slider"
              style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                padding: '8px 4px 20px 4px',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {featuredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    flex: '0 0 280px',
                    minWidth: '280px',
                    maxWidth: '280px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <div
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '100%'
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
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.82) 70%, transparent 100%)',
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Responsive Styles for Desktop Grid View & Mobile Slider */}
      <style>{`
        @media (min-width: 768px) {
          .new-arrivals-grid-container {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
            gap: 24px !important;
            overflow-x: visible !important;
            padding: 8px 0 !important;
          }
          .new-arrivals-grid-item {
            flex: none !important;
            min-width: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          .mobile-slider-controls {
            display: none !important;
          }
          .mobile-swipe-hint {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .new-arrivals-grid-container {
            display: flex !important;
            gap: 16px !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            padding: 8px 4px 20px 4px !important;
            scroll-behavior: smooth !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .new-arrivals-grid-item {
            flex: 0 0 280px !important;
            min-width: 280px !important;
            max-width: 280px !important;
            scroll-snap-align: start !important;
          }
        }
      `}</style>
    </div>
  );
}
