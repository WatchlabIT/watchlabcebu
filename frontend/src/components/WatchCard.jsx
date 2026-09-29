import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import { formatPrice, getWhatsAppUrl, getImageUrl, getMessengerUrl } from '../utils/format';
import ProtectedImage from './ProtectedImage';

export default function WatchCard({ watch, viewMode }) {
  const isAvailable = watch.stock > 0;
  const isList = viewMode === 'list';

  return (
    <div className={`glass-card watch-card ${isList ? 'watch-card-list' : ''}`} style={{
      display: 'flex',
      flexDirection: isList ? 'row' : 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative'
    }}>
      {/* Top Image Container - Clean Unobstructed Photo */}
      <div className="watch-card-img-container" style={{
        position: 'relative',
        width: isList ? '130px' : '100%',
        minWidth: isList ? '130px' : undefined,
        height: isList ? '130px' : undefined,
        paddingTop: isList ? 0 : '80%', // 4:3 Aspect Ratio for Grid
        background: '#F9FAFB',
        overflow: 'hidden',
        flexShrink: 0
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
      <div className="watch-card-body" style={{
        padding: isList ? '14px 18px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        gap: isList ? '8px' : '14px'
      }}>
        <div>
          {/* Top Line: Brand & Gender */}
          <div className="watch-card-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '4px'
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
          <h3 className="font-serif watch-card-title" style={{
            fontSize: isList ? '1.05rem' : '1.15rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: '1.35',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: isList ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {watch.name}
          </h3>

          {/* Price */}
          <div className="watch-card-price" style={{
            fontSize: isList ? '1.2rem' : '1.35rem',
            fontWeight: 800,
            color: 'var(--maroon-primary)',
            marginBottom: isList ? '6px' : '10px'
          }}>
            {formatPrice(watch.price)}
          </div>

          {/* Creative Badges Container inside Card Body */}
          <div className="watch-card-badges" style={{
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
        <div className="watch-card-actions" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: 'auto',
          paddingTop: isList ? '8px' : '12px',
          borderTop: '1px solid var(--border-glass)'
        }}>
          <Link
            to={`/watch/${watch.id}`}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: isList ? '8px 6px' : '10px 8px' }}
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
              padding: isList ? '8px 6px' : '10px 8px',
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
