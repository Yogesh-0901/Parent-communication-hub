import { useEffect, useRef, useState } from 'react';

interface MagneticElement {
  element: HTMLElement;
  strength: number;
  baseTransform: string;
}

export const useAntiGravity = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const magneticElements = useRef<MagneticElement[]>([]);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLElement>(null);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magnetic pull effect
  const registerMagneticElement = (element: HTMLElement, strength: number = 0.15) => {
    const rect = element.getBoundingClientRect();
    const baseTransform = element.style.transform || '';
    
    magneticElements.current.push({
      element,
      strength,
      baseTransform
    });
  };

  const unregisterMagneticElement = (element: HTMLElement) => {
    magneticElements.current = magneticElements.current.filter(
      item => item.element !== element
    );
  };

  // Apply magnetic effects
  useEffect(() => {
    const applyMagneticEffects = () => {
      magneticElements.current.forEach(({ element, strength, baseTransform }) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (mousePosition.x - centerX) * strength;
        const deltaY = (mousePosition.y - centerY) * strength;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 200;
        
        if (distance < maxDistance) {
          const factor = 1 - (distance / maxDistance);
          const translateX = deltaX * factor;
          const translateY = deltaY * factor;
          
          element.style.transform = `${baseTransform} translate(${translateX}px, ${translateY}px) scale(${1 + factor * 0.05})`;
        } else {
          element.style.transform = baseTransform;
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(applyMagneticEffects);
    };

    applyMagneticEffects();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition]);

  // Create floating particles
  const createParticle = (x: number, y: number) => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--duration', `${10 + Math.random() * 10}s`);
    particle.style.setProperty('--delay', `${Math.random() * 2}s`);
    
    return particle;
  };

  // Create light trails
  const createLightTrail = (x: number, y: number) => {
    const trail = document.createElement('div');
    trail.className = 'light-trail';
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    trail.style.setProperty('--duration', `${6 + Math.random() * 4}s`);
    trail.style.setProperty('--delay', `${Math.random() * 2}s`);
    
    return trail;
  };

  // Initialize particle field
  const initializeParticleField = (container: HTMLElement) => {
    const particleField = document.createElement('div');
    particleField.className = 'particle-field';
    
    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = createParticle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      );
      particleField.appendChild(particle);
    }
    
    // Create light trails
    for (let i = 0; i < 5; i++) {
      const trail = createLightTrail(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight
      );
      particleField.appendChild(trail);
    }
    
    container.appendChild(particleField);
    
    return particleField;
  };

  // Parallax scrolling effect
  const applyParallax = (scrollY: number) => {
    if (!containerRef.current) return;
    
    const layers = containerRef.current.querySelectorAll('.parallax-layer');
    layers.forEach((layer, index) => {
      const speed = (index + 1) * 0.5;
      const yPos = -(scrollY * speed);
      (layer as HTMLElement).style.transform = `translateY(${yPos}px)`;
    });
  };

  // Smooth scroll with parallax
  useEffect(() => {
    const handleScroll = () => {
      applyParallax(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    registerMagneticElement,
    unregisterMagneticElement,
    initializeParticleField,
    mousePosition,
    containerRef
  };
};
