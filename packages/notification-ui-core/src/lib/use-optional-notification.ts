import { useContext, useMemo } from 'react';

import { NotificationContext } from './notification-context';
import { NotificationTransportFacade } from './notification-transport-facade';

export function useOptionalNotification(): NotificationTransportFacade | null {
  const transports = useContext(NotificationContext);

  return useMemo(
    () => transports && new NotificationTransportFacade(transports),
    [transports],
  );
}
