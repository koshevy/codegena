import type { ReactElement, ReactNode } from 'react';

import { PanelBodyStyles } from './panel-body.styles';

interface PanelBodyProps {
  children: ReactNode;
}

export function PanelBody({ children }: PanelBodyProps): ReactElement {
  return <PanelBodyStyles>{children}</PanelBodyStyles>;
}
