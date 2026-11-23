import type { ElementType, ReactNode } from 'react';

export interface SiteFooterLink {
  href: string;
  label: string;
}

export interface SiteFooterProps {
  brand?: ReactNode;
  linkComponent?: ElementType;
  navigation: readonly SiteFooterLink[];
  policies: readonly SiteFooterLink[];
  trailing?: ReactNode;
}
