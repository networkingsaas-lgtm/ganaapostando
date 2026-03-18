import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  onReveal?: () => void;
  observeOnly?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  onReveal,
  observeOnly = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timeoutId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = window.setTimeout(() => {
            if (!observeOnly) {
              el.classList.add('sr-visible');
            }
            onReveal?.();
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delay, observeOnly, onReveal]);

  return (
    <div ref={ref} className={observeOnly ? className : `sr-hidden ${className}`}>
      {children}
    </div>
  );
}
