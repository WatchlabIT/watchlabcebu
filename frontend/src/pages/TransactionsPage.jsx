import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, MessageSquare, MapPin, Sparkles, Filter, X, Eye } from 'lucide-react';
import ProtectedImage from '../components/ProtectedImage';

export default function TransactionsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  const transactionsData = [
    {
      id: 1,
      title: 'Meetup in Bohol',
      subtitle: '6 units Sold! Thank you Maam Mafel.',
      location: 'Bohol, Philippines',
      category: 'Out of Town',
      date: 'Recent Handover',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      badge: 'Bohol Handover',
      note: 'Successful inter-island client handover of 6 luxury Seiko & Tissot timepieces with full box and warranty papers.'
    },
    {
      id: 2,
      title: 'Ref. SRPD61',
      subtitle: 'Sold! Thank you Sir Felix.',
      location: 'Cebu City',
      category: 'Meetups',
      date: 'Recent Handover',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      badge: 'In-Person Meetup',
      note: 'Seiko 5 Sports Emerald SRPD61 handed over in person with fullWatch Lab Cebu packaging.'
    },
    {
      id: 3,
      title: 'Delivery via. Maxim',
      subtitle: '6 units Sold! Thank you Maam Eyay.',
      location: 'Metro Cebu',
      category: 'Express Deliveries',
      date: 'Same-Day Dispatch',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop',
      badge: 'Maxim Express',
      note: '6 units securely packed and dispatched via Maxim courier for immediate same-day delivery.'
    },
    {
      id: 4,
      title: 'Ref. SSK001',
      subtitle: 'Brandnew Unit Sold! Thank you Sir.',
      location: 'Cebu Mall Meetup',
      category: 'Meetups',
      date: 'Recent Handover',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      badge: 'Brand New Unit',
      note: 'Seiko 5 GMT SSK001 brand new unit inspected and delivered to client in Cebu.'
    },
    {
      id: 5,
      title: 'Rolex Submariner Date',
      subtitle: 'Pre-owned Unit Sold! Thank you Sir Mark.',
      location: 'IT Park, Cebu',
      category: 'Meetups',
      date: 'Recent Handover',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop',
      badge: 'Luxury Handover',
      note: 'Verified pre-owned Rolex Submariner Date handed over with complete authentication certificate.'
    },
    {
      id: 6,
      title: 'Seiko Presage Cocktail Time',
      subtitle: 'Brandnew Unit Sold! Thank you Maam Grace.',
      location: 'Mandaue City',
      category: 'Express Deliveries',
      date: 'Same-Day Dispatch',
      image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=800&auto=format&fit=crop',
      badge: 'Courier Express',
      note: 'Brand new Seiko Presage Cocktail Time delivered safely to client in Mandaue.'
    }
  ];

  const filteredTransactions = transactionsData.filter(tx => {
    if (activeFilter === 'All') return true;
    return tx.category === activeFilter;
  });

  return (
    <div style={{ padding: '60px 0 100px' }}>
      <div className="container">
        {/* Header Bar matching Reference Photo */}
        <div style={{
          marginBottom: '40px',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: 'var(--maroon-primary)',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            <ShieldCheck size={18} color="var(--maroon-primary)" /> CLIENT HANDOVERS & PROOF OF LEGITIMACY
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <h1 className="font-serif gradient-text" style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              margin: 0
            }}>
              FEATURED TRANSACTIONS
            </h1>

            {/* Transaction Count Pill & Nav Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: '30px',
                padding: '8px 20px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lux)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={16} color="var(--maroon-primary)" /> {transactionsData.length} Verified Transactions
              </div>
            </div>
          </div>
          
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px' }}>
            Real client handovers, in-person meetups, and courier deliveries. Every watch listed at Watch Lab Cebu is 100% authentic and verified.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
          {['All', 'Meetups', 'Express Deliveries', 'Out of Town'].map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className="btn"
              style={{
                padding: '10px 22px',
                fontSize: '0.88rem',
                borderRadius: '25px',
                background: activeFilter === category ? 'var(--maroon-gradient)' : '#FFFFFF',
                color: activeFilter === category ? '#FFFFFF' : 'var(--text-primary)',
                border: activeFilter === category ? 'none' : '1px solid #D1D5DB',
                fontWeight: activeFilter === category ? 700 : 500,
                boxShadow: activeFilter === category ? 'var(--shadow-maroon)' : 'none',
                transition: 'all 0.25 ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Transactions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-card"
              onClick={() => setSelectedTx(tx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Image Container with Dark Green / Maroon Banner at Bottom */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '125%', // Tall aspect ratio as shown in user photo
                background: '#000',
                overflow: 'hidden'
              }}>
                <ProtectedImage
                  src={tx.image}
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

                {/* Top Category Badge */}
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
                  fontWeight: 700,
                  zIndex: 3
                }}>
                  {tx.badge}
                </div>

                {/* Green/Maroon Banner Overlay at Bottom (Exact design as photo) */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 14px',
                  background: 'linear-gradient(to top, rgba(5, 46, 22, 0.95) 0%, rgba(5, 46, 22, 0.85) 70%, transparent 100%)',
                  color: '#FFFFFF',
                  zIndex: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
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
                    color: '#E2E8F0',
                    lineHeight: '1.3'
                  }}>
                    {tx.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Detail View */}
        {selectedTx && (
          <div
            onClick={() => setSelectedTx(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{
                maxWidth: '650px',
                width: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                background: '#FFFFFF'
              }}
            >
              <button
                onClick={() => setSelectedTx(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ position: 'relative', width: '100%', height: '360px', background: '#000' }}>
                <ProtectedImage
                  src={selectedTx.image}
                  alt={selectedTx.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--maroon-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  <MapPin size={14} /> {selectedTx.location} • {selectedTx.category}
                </div>
                <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {selectedTx.title}
                </h2>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10B981', marginBottom: '16px' }}>
                  {selectedTx.subtitle}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  {selectedTx.note}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <a
                    href="https://www.facebook.com/messages/t/533098296554220"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: '25px',
                      background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.95rem'
                    }}
                  >
                    <MessageSquare size={18} /> Inquire About Similar Watches
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
