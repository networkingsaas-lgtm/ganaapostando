import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down';
  delay?: number; // ms
  instant?: boolean;
}

export default function PageReveal({
  children,
  className = '',
  direction = 'up',
  delay = 30,
  instant = false,
}: Props) {
  const [visible, setVisible] = useState(instant);

  useEffect(() => {
    if (instant) {
      setVisible(true);
      return;
    }

    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, instant]);

  const hidden = direction === 'up' ? 'opacity-0 translate-y-8' : 'opacity-0 -translate-y-8';

  return (
    <div className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : hidden} ${className}`}>
      {children}
    </div>
  );
}
