import {
  useOptionalNotification,
  type NotifyOptions,
} from '@codegena/notification-ui-core';
import { useCallback } from 'react';

interface CopyTextWithNotificationOptions {
  failureMessage: string;
  successMessage: string;
  text: string;
}

const notificationOptions: NotifyOptions = {
  onClosed: () => { /* No lifecycle action is needed. */ },
  onShowingAnimationComplete: () => { /* No lifecycle action is needed. */ },
};

export function useCopyTextWithNotification(): (
  options: CopyTextWithNotificationOptions,
) => Promise<void> {
  const notifications = useOptionalNotification();

  return useCallback(async ({
    failureMessage,
    successMessage,
    text,
  }: CopyTextWithNotificationOptions): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
    }
    catch {
      notifications?.notify(
        { fallbackMessage: failureMessage, severity: 'error' },
        notificationOptions,
        'ui',
      );

      return;
    }

    notifications?.notify(
      { fallbackMessage: successMessage, severity: 'success' },
      notificationOptions,
      'ui',
    );
  }, [notifications]);
}
