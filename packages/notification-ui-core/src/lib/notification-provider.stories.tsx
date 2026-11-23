import type { Meta, StoryObj } from '@storybook/react-vite';
import { useCallback, useMemo, useState, type ReactElement } from 'react';

import { NotificationProvider } from './notification-provider';
import type { NotificationTransport } from './notification-transport';
import { useNotification } from './use-notification';

function NotificationControls(): ReactElement {
  const notifications = useNotification();

  const handleNotify = useCallback((): void => {
    notifications.notify(
      { fallbackMessage: 'Types generated successfully' },
      {
        onClosed: () => {
          // The story does not need to react to closing.
        },
        onShowingAnimationComplete: () => {
          // The story renders the message immediately.
        },
      },
      'ui',
    );
  }, [notifications]);

  return (
    <button
      onClick={handleNotify}
      type="button"
    >
      Send UI notification
    </button>
  );
}

function NotificationProviderStory(): ReactElement {
  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);
  const [useAlternate, setUseAlternate] = useState(false);

  const transports = useMemo(() => ['Primary', 'Alternative'].map(
    (label): NotificationTransport => ({
      close: () => {
        // The story only exposes the bulk close action.
      },
      closeAll: () => setMessages([]),
      getType: () => 'ui',
      notify: (message, options) => {
        const entry = {
          id: crypto.randomUUID(),
          text: `${label}: ${message.fallbackMessage}`,
        };

        setMessages((current) => [...current, entry]);
        options.onShowingAnimationComplete();

        return String(Date.now());
      },
      revoke: async () => {
        // The story transport has no queued notifications to revoke.
      },
    }),
  ), []);
  const activeTransport = transports[useAlternate ? 1 : 0];

  const handleSwitchTransport = useCallback((): void => {
    setUseAlternate((current) => !current);
  }, []);

  return (
    <NotificationProvider transport={activeTransport ? [activeTransport] : []}>
      <NotificationControls />
      <button
        onClick={handleSwitchTransport}
        type="button"
      >
        Switch transport
      </button>
      <ul aria-label="Delivered messages">
        {messages.map(({ id, text }) => <li key={id}>{text}</li>)}
      </ul>
    </NotificationProvider>
  );
}

const meta: Meta<typeof NotificationProviderStory> = {
  component: NotificationProviderStory,
  title: 'Codegena/Notifications/Transport contract',
};

export default meta;

export const LocalTransport: StoryObj<typeof NotificationProviderStory> = {};
