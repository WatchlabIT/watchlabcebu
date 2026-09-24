import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { fetchWatchById } from '../utils/api';
import { formatPrice, getWhatsAppUrl, getImageUrl, getMessengerUrl } from '../utils/format';
import ProtectedImage from '../components/ProtectedImage';

export default function WatchDetailPage() {
  const { id } = useParams();

  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWatchById(id);
        if (res && res.watch) {
          setWatch(res.watch);
        } else {
          setError('Watch listing not found.');
        }
      } catch (err) {
        setError('Failed to load watch details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading watch details...
      </div>
    );
  }

  if (error || !watch) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={48} color="#DC2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{error || 'Watch Not Found'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            The requested timepiece could not be found or has been removed from inventory.
          </p>
          <Link to="/collection" className="btn btn-red">
            Back to Watch Collection
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = watch.stock > 0;
  const whatsappUrl = getWhatsAppUrl(watch.name, watch.price);

  return (
    <div className="page-fade-in" style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Back Button */}
        <Link
          to="/collection"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            marginBottom: '32px',
            transition: 'color 0.2s',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={18} /> Back to Collection
        </Link>

        {/* Main Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Left: Large Watch Image */}
          <div className="glass-card" style={{ padding: '16px', borderRadius: '24px', overflow: 'hidden' }}>
            <div style={{
              width: '100%',
              paddingTop: '100%', // 1:1 Square Ratio
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#F3F4F6'
            }}>
              <ProtectedImage
                src={getImageUrl(watch.image_url)}
                alt={watch.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          {/* Right: Watch Info */}
          <div>
            {/* Brand */}
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--red-primary)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              {watch.brand}
            </div>

            {/* Watch Name */}
            <h1 className="font-serif" style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: '1.25',
              marginBottom: '16px'
            }}>
              {watch.name}
            </h1>

            {/* Badges Row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              {watch.condition === 'Brand New' ? (
                <span className="badge badge-brand-new" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  Brand New
                </span>
              ) : (
                <span className="badge badge-pre-owned" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  Pre-Owned
                </span>
              )}

              {isAvailable ? (
                <span className="badge badge-available" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  Available ({watch.stock} in stock)
                </span>
              ) : (
                <span className="badge badge-sold-out" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                  Sold Out
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="glass-card" style={{
              padding: '24px',
              marginBottom: '32px',
              background: 'rgba(220, 38, 38, 0.04)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Listed Price (Philippine Pesos)
              </div>
              <div style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--red-primary)'
              }}>
                {formatPrice(watch.price)}
              </div>
            </div>

            {/* Facebook Messenger Inquiry Button */}
            <div style={{ marginBottom: '32px' }}>
              <a
                href={getMessengerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
                  color: '#FFFFFF'
                }}
              >
                <MessageSquare size={22} /> Chat About This Watch on Messenger
              </a>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Direct message Watch Lab Cebu on Facebook Messenger
              </div>
            </div>

            {/* Specs & Description */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Watch Overview & Description
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.98rem',
                lineHeight: '1.7',
                whiteSpace: 'pre-line'
              }}>
                {watch.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
