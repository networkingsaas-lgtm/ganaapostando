import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration = 1800, enabled = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let start: number | null = null;
    let rafId = 0;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(progress * target);
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, enabled]);

  return enabled ? value : 0;
}
