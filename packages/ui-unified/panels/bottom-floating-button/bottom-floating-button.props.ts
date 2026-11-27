import type { ButtonProps } from '@mui/material/Button';
import type { ReactNode } from 'react';

export interface BottomFloatingButtonProps {
  ariaLabel: string;
  color?: ButtonProps['color'];
  icon: ReactNode;
  label: ReactNode;
  onClick: ButtonProps['onClick'];
  position?: 'absolute' | 'fixed';
}
