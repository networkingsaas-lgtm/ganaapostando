import type { LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}
