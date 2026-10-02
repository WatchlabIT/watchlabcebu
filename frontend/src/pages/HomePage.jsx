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
          fetchNewArrivals(4),
          fetchWatches(),
          fetchTransactions()
        ]);

        const rawArrivals = arrivalsData.watches || [];
        setNewArrivals(rawArrivals.slice(0, 4));

        const watchesList = allWatchesData.watches || [];
        const featuredList = watchesList.filter(w => w && (w.is_featured === true || w.is_featured === 'true' || w.is_featured === 'TRUE' || w.is_featured === 1));
        const finalHeroList = featuredList.length > 0 ? featuredList : (watchesList.length > 0 ? [watchesList[0]] : []);
        setHeroWatches(finalHeroList);

        const txList = txData.transactions || [];
        const filteredTx = txList.filter(t => t.is_featured !== false);
        setFeaturedTransactions(filteredTx.slice(0, 4));
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
                  Trusted Watch Dealer • Cebu based
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

            {/* Right Hero Image Card - Dynamic Hero Slideshow & Maroon Loader */}
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
                  {/* Current Active Watch Image or Maroon Loading Animation */}
                  <div style={{ position: 'relative', height: '420px', borderRadius: '16px', overflow: 'hidden' }}>
                    {loading ? (
                      /* High-end Luxury Maroon Timepiece Loading Animation */
                      <div className="hero-loading-container">
                        {/* Ambient luxury Maroon glow backdrop */}
                        <div style={{
                          position: 'absolute',
                          width: '280px',
                          height: '280px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(127, 29, 29, 0.16) 0%, rgba(127, 29, 29, 0) 70%)',
                          top: '32%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none',
                          animation: 'maroonPulseSoft 3s ease-in-out infinite'
                        }} />

                        {/* Central Maroon Horology Dial Mechanism Loader */}
                        <div style={{
                          position: 'relative',
                          width: '140px',
                          height: '140px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '-35px'
                        }}>
                          {/* Outer Dashed Chronograph Ring */}
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '2px dashed rgba(127, 29, 29, 0.3)',
                            animation: 'dialSpinSlow 24s linear infinite'
                          }} />

                          {/* Middle Glowing Maroon Gradient Arc Track */}
                          <div style={{
                            position: 'absolute',
                            inset: '10px',
                            borderRadius: '50%',
                            border: '3px solid rgba(127, 29, 29, 0.12)',
                            borderTopColor: 'var(--maroon-primary)',
                            borderRightColor: 'var(--maroon-light)',
                            animation: 'dialSpinFast 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                            boxShadow: '0 0 16px rgba(127, 29, 29, 0.22)'
                          }} />

                          {/* Inner Counter-Rotating Precision Ring */}
                          <div style={{
                            position: 'absolute',
                            inset: '24px',
                            borderRadius: '50%',
                            border: '2px solid transparent',
                            borderBottomColor: 'var(--maroon-primary)',
                            borderLeftColor: 'rgba(127, 29, 29, 0.45)',
                            animation: 'dialSpinReverse 3.2s ease-in-out infinite'
                          }} />

                          {/* Center Watch Hub with Sweeping Hands */}
                          <div style={{
                            position: 'relative',
                            width: '58px',
                            height: '58px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)',
                            boxShadow: '0 4px 14px rgba(127, 29, 29, 0.25), inset 0 0 0 1px rgba(127, 29, 29, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {/* Hour Hand */}
                            <div style={{
                              position: 'absolute',
                              top: '15px',
                              left: '27px',
                              width: '4px',
                              height: '16px',
                              background: 'var(--maroon-primary)',
                              borderRadius: '3px',
                              transformOrigin: 'bottom center',
                              animation: 'maroonHandTick 12s linear infinite'
                            }} />
                            {/* Minute Hand */}
                            <div style={{
                              position: 'absolute',
                              top: '9px',
                              left: '28px',
                              width: '2px',
                              height: '22px',
                              background: 'var(--maroon-light)',
                              borderRadius: '2px',
                              transformOrigin: 'bottom center',
                              animation: 'maroonHandTick 2.4s linear infinite'
                            }} />
                            {/* Center Jewel */}
                            <div style={{
                              position: 'relative',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: 'var(--maroon-dark)',
                              border: '2px solid #FFFFFF',
                              boxShadow: '0 0 6px rgba(127, 29, 29, 0.6)',
                              zIndex: 4
                            }} />
                          </div>
                        </div>

                        {/* Status Beacon Indicator */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '5px 14px',
                          borderRadius: '20px',
                          background: 'rgba(127, 29, 29, 0.08)',
                          border: '1px solid rgba(127, 29, 29, 0.2)',
                          marginTop: '16px',
                          color: 'var(--maroon-primary)',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          letterSpacing: '1px'
                        }}>
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: 'var(--maroon-primary)',
                            display: 'inline-block',
                            animation: 'maroonBeacon 1.8s infinite'
                          }} />
                          CURATING FEATURED TIMEPIECES...
                        </div>

                        {/* Matching Floating Glass Skeleton Pill Bar at the bottom */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          right: '10px',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.75)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          borderRadius: '16px',
                          border: '1px solid rgba(127, 29, 29, 0.15)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          {/* Top Line Skeleton */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="maroon-skeleton" style={{ width: '130px', height: '12px', borderRadius: '4px' }} />
                            <div className="maroon-skeleton" style={{ width: '70px', height: '18px', borderRadius: '12px' }} />
                          </div>
                          {/* Title & Price Row Skeleton */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                              <div className="maroon-skeleton" style={{ width: '65%', height: '18px', borderRadius: '4px' }} />
                              <div className="maroon-skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
                            </div>
                            <div className="maroon-skeleton" style={{ width: '100px', height: '34px', borderRadius: '20px', flexShrink: 0 }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#F9FAFB',
                            borderRadius: '16px',
                            color: 'var(--text-muted)',
                            padding: '24px',
                            textAlign: 'center'
                          }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                              No Featured Timepieces Available
                            </p>
                            <Link to="/collection" className="btn btn-outline-maroon" style={{ fontSize: '0.85rem' }}>
                              Explore Collection
                            </Link>
                          </div>
                        )}

                        {/* Gradual Bottom Glass Bar Overlay for Maximum Watch Image Visibility */}
                        {currentHero && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '25%',
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
                            pointerEvents: 'none',
                            zIndex: 5
                          }} />
                        )}

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
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
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
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}

                        {/* Gradual Overlay Text & Content inside Glass Floating Pill Bar */}
                        {currentHero && (
                          <div
                            key={`hero-text-${currentHero.id || heroIndex}-${heroIndex}`}
                            className="hero-text-animate"
                            style={{
                              position: 'absolute',
                              bottom: '10px',
                              left: '10px',
                              right: '10px',
                              padding: '10px 14px',
                              background: 'rgba(255, 255, 255, 0.38)',
                              backdropFilter: 'blur(16px)',
                              WebkitBackdropFilter: 'blur(16px)',
                              borderRadius: '16px',
                              border: '1px solid rgba(255, 255, 255, 0.55)',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                              zIndex: 8,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            {/* Top Line: Label & Condition Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{
                                fontSize: '0.72rem',
                                color: '#111827',
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
                                  background: currentHero.condition === 'Brand New' ? 'var(--maroon-primary)' : 'rgba(17, 24, 39, 0.08)',
                                  color: currentHero.condition === 'Brand New' ? '#FFFFFF' : 'var(--maroon-primary)',
                                  border: '1px solid var(--border-subtle)',
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
                                    fontWeight: 800,
                                    color: '#111827',
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
                                  color: 'var(--maroon-primary)',
                                  marginTop: '2px'
                                }}>
                                  {formatPrice(currentHero.price)}
                                </div>
                              </div>

                              <Link
                                to={`/watch/${currentHero.id}`}
                                className="btn btn-maroon"
                                style={{
                                  fontSize: '0.82rem',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  flexShrink: 0
                                }}
                              >
                                View Details <ArrowRight size={14} />
                              </Link>
                            </div>

                            {/* Pagination Indicator Dots */}
                            {heroWatches.length > 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
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
                                      background: idx === heroIndex ? 'var(--maroon-primary)' : 'rgba(0, 0, 0, 0.25)',
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
                      </>
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

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px 0' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '3px solid rgba(127, 29, 29, 0.12)',
                borderTopColor: 'var(--maroon-primary)',
                animation: 'dialSpinFast 1s linear infinite'
              }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--maroon-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
                Loading new arrivals...
              </span>
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
                  Recent Transactions
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

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px 0' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '3px solid rgba(127, 29, 29, 0.12)',
                borderTopColor: 'var(--maroon-primary)',
                animation: 'dialSpinFast 1s linear infinite'
              }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--maroon-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
                Loading featured transactions...
              </span>
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
