import { useEffect, useRef, useState } from 'react';

export const usePerformanceOptimization = () => {
  const [fps, setFps] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number>();

  // Monitor FPS
  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        setFps(currentFps);
        setIsLowPerformance(currentFps < 30);
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationFrameId.current = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Reduce animation quality on low performance
  const getAnimationQuality = () => {
    if (isLowPerformance) {
      return {
        particleCount: 5,
        animationDuration: '20s',
        enableParallax: false,
        floatingIntensity: 'slow' as const,
        magneticStrength: 0.05
      };
    }
    
    return {
      particleCount: 20,
      animationDuration: '10s',
      enableParallax: true,
      floatingIntensity: 'normal' as const,
      magneticStrength: 0.15
    };
  };

  // Debounced function for performance
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Throttled function for performance
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  return {
    fps,
    isLowPerformance,
    getAnimationQuality,
    debounce,
    throttle
  };
};
