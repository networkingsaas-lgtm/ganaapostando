import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  uppercase?: boolean;
  lineHeightClass?: string;
  style?: CSSProperties;
}

export default function HeaderTitle({
  children,
  className = '',
  as = 'h1',
  uppercase = true,
  lineHeightClass = 'leading-[0.95]',
  style,
}: Props) {
  const Tag = as;
  return (
    <Tag
      className={`hero-impact-font ${uppercase ? 'uppercase' : ''} ${lineHeightClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}
