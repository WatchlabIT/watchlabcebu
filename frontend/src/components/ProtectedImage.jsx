import React from 'react';

export default function ProtectedImage({ src, alt, style = {}, className = '', ...props }) {
  const handlePrevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitUserDrag: 'none',
        width: style.width || '100%',
        height: style.height || '100%',
        ...style
      }}
      className={`protected-image-container ${className}`}
      onContextMenu={handlePrevent}
      onDragStart={handlePrevent}
    >
      {/* Image Element with Inline Protection Props */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onContextMenu={handlePrevent}
        onDragStart={handlePrevent}
        style={{
          width: '100%',
          height: '100%',
          objectFit: style.objectFit || 'cover',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitUserDrag: 'none',
          pointerEvents: 'auto',
          ...style
        }}
        {...props}
      />

      {/* Transparent Anti-Inspect / Anti-Right-Click Overlay */}
      <div
        onContextMenu={handlePrevent}
        onDragStart={handlePrevent}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          background: 'transparent',
          cursor: style.cursor || 'pointer',
          pointerEvents: 'auto',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
