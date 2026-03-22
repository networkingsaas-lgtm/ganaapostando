import { Map as MapIcon, Settings, Users } from 'lucide-react';
import type { SidebarNavItem } from './types';

export const LOGOUT_MODAL_CLOSE_MS = 200;
export const SIDEBAR_WIDTH_CLASS = 'lg:w-[360px] lg:min-w-[360px] lg:max-w-[360px] xl:w-[400px] xl:min-w-[400px] xl:max-w-[400px]';
export const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { path: 'mapa', label: 'Mapa', icon: MapIcon },
  { path: 'grupo-apuestas', label: 'Grupo de apuestas', icon: Users, disabled: true },
  { path: 'ajustes', label: 'Ajustes', icon: Settings },
];
