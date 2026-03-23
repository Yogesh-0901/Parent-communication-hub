import React, { useEffect, useRef, ReactNode } from 'react';
import { useAntiGravity } from '../hooks/useAntiGravity';
import '../styles/anti-gravity.css';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  magneticStrength?: number;
  floatingIntensity?: 'slow' | 'normal' | 'fast';
  enableHover?: boolean;
  enableGlow?: boolean;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  magneticStrength = 0.15,
  floatingIntensity = 'normal',
  enableHover = true,
  enableGlow = true,
  delay = 0
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { registerMagneticElement, unregisterMagneticElement } = useAntiGravity();

  useEffect(() => {
    if (elementRef.current && magneticStrength > 0) {
      registerMagneticElement(elementRef.current, magneticStrength);
      
      return () => {
        if (elementRef.current) {
          unregisterMagneticElement(elementRef.current);
        }
      };
    }
  }, [magneticStrength, registerMagneticElement, unregisterMagneticElement]);

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

  const classes = [
    'gpu-accelerated',
    'smooth-animation',
    getFloatingClass(),
    enableHover && 'anti-gravity-hover',
    enableGlow && 'zero-gravity-glow',
    magneticStrength > 0 && 'magnetic-element',
    className
  ].filter(Boolean).join(' ');

  const style = delay > 0 ? {
    animationDelay: `${delay}s`
  } : undefined;

  return (
    <div
      ref={elementRef}
      className={classes}
      style={style}
    >
      {children}
    </div>
  );
};
