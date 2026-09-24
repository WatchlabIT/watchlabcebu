import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import { formatPrice, getWhatsAppUrl, getImageUrl, getMessengerUrl } from '../utils/format';
import ProtectedImage from './ProtectedImage';

export default function WatchCard({ watch }) {
  const isAvailable = watch.stock > 0;

  return (
    <div className="glass-card watch-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative'
    }}>
      {/* Top Image Container - Clean Unobstructed Photo */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '80%', // 4:3 Aspect Ratio
        background: '#F9FAFB',
        overflow: 'hidden'
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

      {/* Card Content Body */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div>
          {/* Top Line: Brand & Gender */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--maroon-primary)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              {watch.brand}
            </div>

            {watch.gender && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                background: '#F3F4F6',
                padding: '2px 8px',
                borderRadius: '10px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                border: '1px solid var(--border-glass)'
              }}>
                {watch.gender}
              </span>
            )}
          </div>

          {/* Watch Title */}
          <h3 className="font-serif" style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: '1.35',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {watch.name}
          </h3>

          {/* Price */}
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--maroon-primary)',
            marginBottom: '10px'
          }}>
            {formatPrice(watch.price)}
          </div>

          {/* Creative Badges Container inside Card Body */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center'
          }}>
            {/* Condition Badge */}
            {watch.condition === 'Brand New' ? (
              <span className="badge badge-brand-new" style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>
                Brand New
              </span>
            ) : (
              <span className="badge badge-pre-owned" style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>
                Pre-Owned
              </span>
            )}

            {/* Stock Badge */}
            {isAvailable ? (
              <span className="badge badge-available" style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>
                Available ({watch.stock})
              </span>
            ) : (
              <span className="badge badge-sold-out" style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px' }}>
                Sold Out
              </span>
            )}
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
            href={getMessengerUrl(watch.name, watch.price)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              fontSize: '0.82rem',
              padding: '10px 8px',
              background: 'linear-gradient(135deg, #0084FF 0%, #00C6FF 100%)',
              color: '#FFFFFF'
            }}
            title="Inquire about this watch on Facebook Messenger"
          >
            <MessageSquare size={15} /> Chat
          </a>
        </div>
      </div>
    </div>
  );
}
