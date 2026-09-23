import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import { formatPrice, getWhatsAppUrl, getImageUrl } from '../utils/format';

export default function WatchCard({ watch }) {
  const isAvailable = watch.stock > 0;
  const whatsappUrl = getWhatsAppUrl(watch.name, watch.price);

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative'
    }}>
      {/* Top Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '80%', // 4:3 Aspect Ratio
        background: '#F9FAFB',
        overflow: 'hidden'
      }}>
        <img
          src={getImageUrl(watch.image_url)}
          alt={watch.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />

        {/* Condition Badge (Top Left) */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          {watch.condition === 'Brand New' ? (
            <span className="badge badge-brand-new">Brand New</span>
          ) : (
            <span className="badge badge-pre-owned">Pre-Owned</span>
          )}
        </div>

        {/* Stock Badge (Top Right) */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          {isAvailable ? (
            <span className="badge badge-available">
              Available ({watch.stock})
            </span>
          ) : (
            <span className="badge badge-sold-out">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          {/* Brand */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--maroon-primary)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            {watch.brand}
          </div>

          {/* Watch Title */}
          <h3 className="font-serif" style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: '1.4',
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {watch.name}
          </h3>

          {/* Price */}
          <div style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--maroon-primary)'
          }}>
            {formatPrice(watch.price)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-glass)'
        }}>
          <Link
            to={`/watch/${watch.id}`}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '10px 8px' }}
          >
            <Eye size={15} /> Details
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ fontSize: '0.82rem', padding: '10px 8px' }}
            title="Inquire about this watch on WhatsApp"
          >
            <MessageSquare size={15} /> Chat
          </a>
        </div>
      </div>
    </div>
  );
}
