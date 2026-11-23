import type { MouseEvent, ReactNode } from 'react';

export interface FileDetailsHeaderProps {
  actions?: ReactNode;
  ariaExpanded?: boolean;
  ariaLabel?: string;
  icon: ReactNode;
  isSelected?: boolean;
  name: string;
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  tooltipTitle?: string;
}
