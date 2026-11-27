import type { NotificationMessage } from '@codegena/notification-ui-core';

export function createNotificationMessageKey(
  message: Pick<NotificationMessage, 'title' | 'fallbackMessage'>,
): string {
  return [message.title ?? 'no-title', message.fallbackMessage].join(':');
}
