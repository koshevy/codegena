import { NotistackNotificationProvider } from '@codegena/notification-ui-notistack';
import type { ReactElement } from 'react';

export function withPlaygroundNotifications(
  Story: () => ReactElement,
): ReactElement {
  return (
    <NotistackNotificationProvider>
      <Story />
    </NotistackNotificationProvider>
  );
}
