import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/format';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '10px'
    }}>
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(37, 211, 102, 0.4)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '260px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
            <span style={{ fontWeight: 700, color: '#128C7E' }}>Chat with Watch Lab Cebu!</span>
            <br />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inquire about watches & pricing</span>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Watch Lab Cebu on WhatsApp"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(37, 211, 102, 0.4)',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '2px solid rgba(255, 255, 255, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <MessageSquare size={28} fill="currentColor" />
      </a>
    </div>
  );
}
