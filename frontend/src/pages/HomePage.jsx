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
  const [outgoingHero, setOutgoingHero] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next');
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

  const triggerSlideChange = (newIndex, direction) => {
    if (newIndex === heroIndex || heroWatches.length <= 1) return;
    setOutgoingHero(heroWatches[heroIndex] || null);
    setSlideDirection(direction);
    setHeroIndex(newIndex);
  };

  const handleNextSlide = () => {
    if (heroWatches.length <= 1) return;
    const nextIdx = (heroIndex + 1) % heroWatches.length;
    triggerSlideChange(nextIdx, 'next');
  };

  const handlePrevSlide = () => {
    if (heroWatches.length <= 1) return;
    const prevIdx = (heroIndex - 1 + heroWatches.length) % heroWatches.length;
    triggerSlideChange(prevIdx, 'prev');
  };

  const handleDotClick = (idx) => {
    if (idx === heroIndex) return;
    triggerSlideChange(idx, idx > heroIndex ? 'next' : 'prev');
  };

  // Clear outgoing hero after cross-fade animation completes (500ms)
  useEffect(() => {
    if (!outgoingHero) return;
    const timer = setTimeout(() => {
      setOutgoingHero(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [outgoingHero]);

  // Auto-play timer for Hero Slideshow (cycles every 5s unless hovered)
  useEffect(() => {
    if (heroWatches.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setHeroIndex(currentIdx => {
        const nextIdx = (currentIdx + 1) % heroWatches.length;
        setOutgoingHero(heroWatches[currentIdx] || null);
        setSlideDirection('next');
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroWatches, isPaused]);

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
                  {/* Current Active Watch Image with Smooth Cross-Fade */}
                  <div style={{ position: 'relative', height: '420px', borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Outgoing Slide (Fading Out) */}
                    {outgoingHero && (
                      <ProtectedImage
                        key={`outgoing-hero-${outgoingHero.id || 'out'}`}
                        src={getImageUrl(outgoingHero.image_url)}
                        alt={outgoingHero.name}
                        className="hero-animate-fade-out"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          display: 'block',
                          zIndex: 1
                        }}
                      />
                    )}

                    {/* Incoming Slide (Fading / Sliding In) */}
                    {currentHero ? (
                      <ProtectedImage
                        key={`hero-img-${currentHero.id || heroIndex}-${heroIndex}`}
                        src={getImageUrl(currentHero.image_url)}
                        alt={currentHero.name}
                        className={slideDirection === 'next' ? 'hero-animate-next' : 'hero-animate-prev'}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          display: 'block',
                          zIndex: 2
                        }}
                      />
                    ) : (
                      <ProtectedImage
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
                        alt="Watch Lab Cebu Featured Timepiece"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                      />
                    )}

                    {/* Gradual Bottom Gradient Overlay for Seamless Text Readability */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(to top, rgba(12, 14, 18, 0.95) 0%, rgba(12, 14, 18, 0.72) 55%, rgba(0, 0, 0, 0) 100%)',
                      pointerEvents: 'none',
                      zIndex: 5
                    }} />

                    {/* Slideshow Arrow Navigation (Show if more than 1 hero watch) */}
                    {heroWatches.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrevSlide();
                          }}
                          aria-label="Previous Slide"
                          style={{
                            position: 'absolute',
                            top: '40%',
                            left: '12px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextSlide();
                          }}
                          aria-label="Next Slide"
                          style={{
                            position: 'absolute',
                            top: '40%',
                            right: '12px',
                            transform: 'translateY(-50%)',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10,
                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Gradual Overlay Text & Content */}
                    {currentHero && (
                      <div
                        key={`hero-text-${currentHero.id || heroIndex}-${heroIndex}`}
                        className="hero-text-animate"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '20px 24px',
                          zIndex: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        {/* Top Line: Label & Condition Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{
                            fontSize: '0.72rem',
                            color: '#FCA5A5',
                            fontWeight: 800,
                            letterSpacing: '1.2px',
                            textTransform: 'uppercase'
                          }}>
                            FEATURED TIMEPIECE {heroWatches.length > 1 ? `(${heroIndex + 1}/${heroWatches.length})` : ''}
                          </div>

                          {currentHero.condition && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: currentHero.condition === 'Brand New' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.2)',
                              color: '#FFFFFF',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              letterSpacing: '0.5px'
                            }}>
                              {currentHero.condition}
                            </span>
                          )}
                        </div>

                        {/* Title & Price Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <Link
                              to={`/watch/${currentHero.id}`}
                              className="font-serif"
                              style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                display: 'block',
                                textDecoration: 'none',
                                lineHeight: '1.3'
                              }}
                            >
                              {currentHero.name}
                            </Link>
                            <div style={{
                              fontSize: '1.2rem',
                              fontWeight: 800,
                              color: '#FBBF24',
                              marginTop: '2px'
                            }}>
                              {formatPrice(currentHero.price)}
                            </div>
                          </div>

                          <Link
                            to={`/watch/${currentHero.id}`}
                            className="btn"
                            style={{
                              fontSize: '0.82rem',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              background: '#FFFFFF',
                              color: '#111827',
                              fontWeight: 700,
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                          >
                            View Details <ArrowRight size={14} />
                          </Link>
                        </div>

                        {/* Pagination Indicator Dots */}
                        {heroWatches.length > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                            {heroWatches.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleDotClick(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                style={{
                                  width: idx === heroIndex ? '22px' : '6px',
                                  height: '6px',
                                  borderRadius: '3px',
                                  background: idx === heroIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
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
