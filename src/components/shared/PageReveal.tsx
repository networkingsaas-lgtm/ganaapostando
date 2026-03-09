import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down';
  delay?: number; // ms
}

export default function PageReveal({ children, className = '', direction = 'up', delay = 30 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const hidden = direction === 'up' ? 'opacity-0 translate-y-8' : 'opacity-0 -translate-y-8';

  return (
    <div className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : hidden} ${className}`}>
      {children}
    </div>
  );
}
