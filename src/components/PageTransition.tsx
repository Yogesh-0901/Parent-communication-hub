import React, { useEffect, useState } from 'react';
import '../styles/anti-gravity.css';

interface PageTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isActive,
  duration = 800
}) => {
  const [shouldRender, setShouldRender] = useState(isActive);
  const [transitionClass, setTransitionClass] = useState('');

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
      // Enter animation
      setTimeout(() => {
        setTransitionClass('page-transition-enter-active');
      }, 50);
    } else {
      // Exit animation
      setTransitionClass('page-transition-exit-active');
      setTimeout(() => {
        setShouldRender(false);
        setTransitionClass('');
      }, duration);
    }
  }, [isActive, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`page-transition-enter ${transitionClass} gpu-accelerated`}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};
