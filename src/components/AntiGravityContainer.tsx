import React, { useEffect, useRef, ReactNode } from 'react';
import { useAntiGravity } from '../hooks/useAntiGravity';
import '../styles/anti-gravity.css';

interface AntiGravityContainerProps {
  children: ReactNode;
  className?: string;
  enableParticles?: boolean;
  enableParallax?: boolean;
  floatingIntensity?: 'slow' | 'normal' | 'fast';
}

export const AntiGravityContainer: React.FC<AntiGravityContainerProps> = ({
  children,
  className = '',
  enableParticles = true,
  enableParallax = true,
  floatingIntensity = 'normal'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initializeParticleField, containerRef: hookRef } = useAntiGravity();

  useEffect(() => {
    if (containerRef.current) {
      hookRef.current = containerRef.current;
      
      if (enableParticles) {
        const particleField = initializeParticleField(containerRef.current);
        return () => {
          particleField?.remove();
        };
      }
    }
  }, [enableParticles, initializeParticleField, hookRef]);

  const getFloatingClass = () => {
    switch (floatingIntensity) {
      case 'slow':
        return 'anti-gravity-element-slow';
      case 'fast':
        return 'anti-gravity-element-fast';
      default:
        return 'anti-gravity-element';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`zero-gravity-container gpu-accelerated ${className}`}
    >
      {enableParallax && (
        <>
          <div className="parallax-layer parallax-bg">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-pink-900/10" />
          </div>
          <div className="parallax-layer parallax-mid">
            <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-32 right-32 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          </div>
          <div className="parallax-layer parallax-fg">
            <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-fuchsia-500/5 rounded-full blur-2xl" />
          </div>
        </>
      )}
      
      <div className={`relative z-10 ${getFloatingClass()}`}>
        {children}
      </div>
    </div>
  );
};
