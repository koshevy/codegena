import type { ReactNode, Ref, MouseEventHandler } from 'react';

import type { Severity } from '../severity';

export interface SeverityCardProps {
  ariaLabel: string;
  children?: ReactNode;
  heading: ReactNode;
  message: ReactNode;
  onContextMenu?: MouseEventHandler<HTMLElement>;
  ref?: Ref<HTMLElement>;
  severity: Severity;
}
