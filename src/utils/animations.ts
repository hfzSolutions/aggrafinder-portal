
import { useEffect, useRef, useState } from "react";

// Function to handle scroll-triggered animations
export const useScrollAnimation = (
  threshold = 0.1,
  rootMargin = "0px",
  animationDelay = 0
) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, animationDelay);
          
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, animationDelay]);

  return [ref, isVisible];
};

// Function to add staggered delay to child elements
export const staggeredDelay = (index: number, baseDelay = 100) => {
  return {
    animationDelay: `${index * baseDelay}ms`,
  };
};

// Hook to detect when an element is in viewport
export const useInView = (options = {}) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, inView];
};

// Function to create spring animations
export const springAnimation = (element: HTMLElement, config = { stiffness: 100, damping: 10 }) => {
  let velocity = 0;
  let animationFrame: number;
  
  const animate = (targetValue: number, currentValue: number) => {
    const spring = config.stiffness * (targetValue - currentValue);
    const damper = config.damping * velocity;
    const acceleration = spring - damper;
    
    velocity += acceleration * 0.001;
    const newValue = currentValue + velocity;
    
    element.style.transform = `translateY(${newValue}px)`;
    
    if (Math.abs(targetValue - newValue) < 0.1 && Math.abs(velocity) < 0.1) {
      cancelAnimationFrame(animationFrame);
      element.style.transform = `translateY(${targetValue}px)`;
      return;
    }
    
    animationFrame = requestAnimationFrame(() => animate(targetValue, newValue));
  };
  
  return { animate };
};
