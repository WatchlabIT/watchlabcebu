import React, { useEffect, useRef } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  animation = 'up', // 'up' | 'fade' | 'left' | 'right' | 'zoom'
  delay = 0,
  threshold = 0.12,
  style = {}
}) {
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            observer.unobserve(node);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  const animationClass =
    animation === 'fade' ? 'reveal-fade' :
    animation === 'left' ? 'reveal-left' :
    animation === 'right' ? 'reveal-right' :
    animation === 'zoom' ? 'reveal-zoom' : 'reveal-on-scroll';

  return (
    <div
      ref={domRef}
      className={`${animationClass} ${className}`.trim()}
      style={{
        transitionDelay: delay ? `${delay}ms` : '0ms',
        ...style
      }}
    >
      {children}
    </div>
  );
}
