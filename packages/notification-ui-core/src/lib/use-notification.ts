import { useContext, useMemo } from 'react';

import { NotificationContext } from './notification-context';
import { NotificationTransportFacade } from './notification-transport-facade';

export function useNotification(): NotificationTransportFacade {
  const transports = useContext(NotificationContext);
  const facade = useMemo(
    () => transports && new NotificationTransportFacade(transports),
    [transports],
  );

  if (!facade) {
    throw new Error('useNotification requires a NotificationProvider.');
  }

  return facade;
}
