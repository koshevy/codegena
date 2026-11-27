import type { ComponentType, ReactNode } from 'react';

export interface OverlayNavigationItem {
  href: string;
  icon: ComponentType;
  label: string;
  onSelect?: () => void;
}

export interface OverlayNavigationProps {
  action: OverlayNavigationItem;
  choices: ReactNode;
  id: string;
  items: readonly OverlayNavigationItem[];
  onClose: () => void;
}
