import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
}

export default function ScrollReveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('sr-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`sr-hidden ${className}`}>
      {children}
    </div>
  );
}
