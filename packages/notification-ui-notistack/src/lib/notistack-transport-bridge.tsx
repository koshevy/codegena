import { NotificationProvider } from '@codegena/notification-ui-core';
import { useSnackbar } from 'notistack';
import { useMemo, type ReactElement, type ReactNode } from 'react';

import {
  NotistackNotificationTransport,
} from './notistack-notification-transport';

export interface NotistackTransportBridgeProps {
  children: ReactNode;
  maxVisible: number;
}

export function NotistackTransportBridge({
  children,
  maxVisible,
}: NotistackTransportBridgeProps): ReactElement {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const transport = useMemo(
    () => new NotistackNotificationTransport(
      { closeSnackbar, enqueueSnackbar },
      maxVisible,
    ),
    [
      closeSnackbar,
      enqueueSnackbar,
      maxVisible,
    ],
  );

  const transports = useMemo(() => [transport], [transport]);

  return (
    <NotificationProvider
      transport={transports}
    >
      {children}
    </NotificationProvider>
  );
}
