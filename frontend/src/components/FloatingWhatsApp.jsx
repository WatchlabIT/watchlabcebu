import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { getMessengerUrl } from '../utils/format';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setShowTooltip(false);
      setIsClosing(false);
    }, 350);
  };

  useEffect(() => {
    // Pop out after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showTooltip && !isClosing) {
      // Auto-hide after 7 seconds of being shown
      const autoHideTimer = setTimeout(() => {
        handleClose();
      }, 7000);

      return () => clearTimeout(autoHideTimer);
    }
  }, [showTooltip, isClosing]);

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
      <style>{`
        @keyframes chatPopIn {
          0% {
            opacity: 0;
            transform: scale(0.2) translateY(20px);
          }
          70% {
            transform: scale(1.05) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes chatZoomOutToButton {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.1) translateY(20px);
          }
        }
      `}</style>

      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div style={{
          background: '#FFFFFF',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(127, 29, 29, 0.3)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 10px 30px rgba(127, 29, 29, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '260px',
          transformOrigin: 'bottom right',
          animation: isClosing
            ? 'chatZoomOutToButton 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'chatPopIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
            <span style={{ fontWeight: 700, color: 'var(--maroon-primary)' }}>Chat with Watch Lab Cebu!</span>
            <br />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inquire about watches & pricing</span>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close Chat Popup"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={getMessengerUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Watch Lab Cebu on Messenger"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'var(--maroon-gradient)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(127, 29, 29, 0.4)',
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
