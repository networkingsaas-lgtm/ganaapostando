import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  uppercase?: boolean;
  lineHeightClass?: string;
  style?: CSSProperties;
  useImpactFont?: boolean;
}

export default function HeaderTitle({
  children,
  className = '',
  as = 'h1',
  uppercase = true,
  lineHeightClass = 'leading-[0.95]',
  style,
  useImpactFont = true,
}: Props) {
  const Tag = as;
  return (
    <Tag
      className={`${useImpactFont ? 'hero-impact-font' : ''} ${uppercase ? 'uppercase' : ''} ${lineHeightClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}
