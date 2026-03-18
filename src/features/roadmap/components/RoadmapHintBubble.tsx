import type { ReactNode } from 'react';

interface Props {
  side: 'left' | 'right';
  borderColor: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  animate?: boolean;
}

export default function RoadmapHintBubble({
  side,
  borderColor,
  children,
  className = '',
  contentClassName = '',
  animate = true,
}: Props) {
  const animationClassName = animate
    ? side === 'right'
      ? 'roadmap-skip-hint-right'
      : 'roadmap-skip-hint-left'
    : '';

  return (
    <div
      className={`pointer-events-none absolute top-1/2 z-40 -translate-y-1/2 ${
        side === 'right' ? 'left-[calc(100%+10px)]' : 'right-[calc(100%+10px)]'
      } ${className}`}
    >
      <div
        className={`relative rounded-2xl border bg-white shadow-[0_10px_20px_rgba(15,23,42,0.16)] ${animationClassName} ${contentClassName}`}
        style={{ borderColor }}
      >
        {children}
        <span
          className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white ${
            side === 'right' ? '-left-1 border-b border-l' : '-right-1 border-r border-t'
          }`}
          style={{ borderColor }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

