import { SnackbarProvider } from 'notistack';
import type { ReactElement, ReactNode } from 'react';

import { NotistackContent } from './notistack-content';
import { NotistackTransportBridge } from './notistack-transport-bridge';

export interface NotistackNotificationProviderProps {
  children: ReactNode;
  maxVisible?: number;
}

export function NotistackNotificationProvider({
  children,
  maxVisible = 4,
}: NotistackNotificationProviderProps): ReactElement {
  const visibleLimit = Math.max(2, Math.floor(maxVisible));

  return (
    <SnackbarProvider
      Components={{
        default: NotistackContent,
        error: NotistackContent,
        info: NotistackContent,
        success: NotistackContent,
        warning: NotistackContent,
      }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      maxSnack={visibleLimit}
    >
      <NotistackTransportBridge maxVisible={visibleLimit}>
        {children}
      </NotistackTransportBridge>
    </SnackbarProvider>
  );
}
