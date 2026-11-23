import type { ReactElement, ReactNode } from 'react';

import { NotificationContext } from './notification-context';
import type { NotificationTransport } from './notification-transport';

export interface NotificationProviderProps {
  children: ReactNode;
  transport: NotificationTransport[];
}

export function NotificationProvider({
  children,
  transport,
}: NotificationProviderProps): ReactElement {
  return (
    <NotificationContext.Provider value={transport}>
      {children}
    </NotificationContext.Provider>
  );
}
