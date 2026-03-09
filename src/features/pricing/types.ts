import type { ComponentType } from 'react';

export interface PricingPlan {
  name: string;
  icon: ComponentType<{ className?: string }>;
  price: string;
  description: string;
  features: string[];
  content?: string[];
  highlighted: boolean;
  recommended: boolean;
}
