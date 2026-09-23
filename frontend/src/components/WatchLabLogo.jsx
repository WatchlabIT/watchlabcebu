import React from 'react';

export default function WatchLabLogo({ size = 42, className = '' }) {
  return (
    <img
      src="/watchlab-logo.png"
      alt="WatchLab Cebu Logo"
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: '50%',
        display: 'block'
      }}
    />
  );
}
