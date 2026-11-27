import { useCallback, useSyncExternalStore, type ReactElement } from 'react';

import type { NotistackNotificationTransport } from '../notistack-notification-transport';
import { NotificationGroupCard } from './notification-group-card';

export interface NotificationGroupCardContainerProps {
  transport: NotistackNotificationTransport;
}

export function NotificationGroupCardContainer({
  transport,
}: NotificationGroupCardContainerProps): ReactElement {
  const grouped = useSyncExternalStore(
    transport.subscribeToGrouped,
    transport.getGroupedSnapshot,
    transport.getGroupedSnapshot,
  );

  const notifications = grouped.map(({ id, message }) => ({
    actionGrip: transport.getActionGrip(id),
    id,
    message,
    onClose: () => transport.getActionGrip(id).close(),
  }));

  const handleDismissGrouped = useCallback((): void => {
    transport.closeGrouped();
  }, [transport]);

  return (
    <NotificationGroupCard
      notifications={notifications}
      onDismissGrouped={handleDismissGrouped}
    />
  );
}
