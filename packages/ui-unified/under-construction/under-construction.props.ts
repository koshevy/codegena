import type { ReactNode } from 'react';

export interface UnderConstructionProps {
  /**
   * Content shown once this tab has acknowledged the notice.
   */
  children?: ReactNode;
  /**
   * Warning text displayed in the notice and read as its accessible description.
   */
  disclamerText: string;
}
