import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  inverted?: boolean;
}

export default function TitleHighlightReverse({ children, className = '', inverted = false }: Props) {
  return (
    <span
      className={`title-span-highlight title-span-highlight-reverse ${
        inverted ? 'title-span-highlight-reverse-invert' : ''
      } ${className}`.trim()}
    >
      {children}
    </span>
  );
}
