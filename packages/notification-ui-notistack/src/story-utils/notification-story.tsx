import {
  useNotification,
  type NotificationMessage,
} from '@codegena/notification-ui-core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useCallback, useState, type ReactElement } from 'react';

export type NotificationStoryScenario
  = 'severities' | 'actions' | 'overflow' | 'titleless';

export interface NotificationStoryProps {
  scenario: NotificationStoryScenario;
}

const severityMessages: NotificationMessage[] = [
  { fallbackMessage: 'Schema converted', severity: 'success', title: 'Ready' },
  { fallbackMessage: 'Some fields need review', severity: 'warning', title: 'Review' },
  { fallbackMessage: 'Source could not be loaded', severity: 'error', title: 'Error' },
];

const titlelessMessages: NotificationMessage[] = [
  { fallbackMessage: 'Warning copied', severity: 'success' },
];

const actionMessages: NotificationMessage[] = [{
  actions: [{
    title: 'Dismiss',
    onClick: () => 'close',
  }],
  fallbackMessage: 'The generated types are ready to inspect.',
  message: <strong>The generated types are ready to inspect.</strong>,
  severity: 'primary',
  title: 'Generation complete',
}];

const overflowMessages: NotificationMessage[] = Array.from({ length: 8 }, (_, index) => ({
  fallbackMessage: `Generated declaration ${index + 1} needs review`,
  severity: index % 2 === 0 ? 'info' : 'warning',
  title: `Declaration ${index + 1}`,
}));

const messagesByScenario: Record<NotificationStoryScenario, NotificationMessage[]> = {
  actions: actionMessages,
  overflow: overflowMessages,
  severities: severityMessages,
  titleless: titlelessMessages,
};

export function NotificationStory({ scenario }: NotificationStoryProps): ReactElement {
  const notification = useNotification();
  const [events, setEvents] = useState<Array<{ id: string; text: string }>>([]);
  const messages = messagesByScenario[scenario];

  const handleSendMessages = useCallback((): void => {
    messages.forEach((message) => {
      notification.notify(message, {
        onClosed: (reason) => {
          const event = { id: crypto.randomUUID(), text: `Closed: ${reason}` };

          setEvents((current) => [event, ...current]);
        },
        onShowingAnimationComplete: () => {
          const event = {
            id: crypto.randomUUID(),
            text: `Shown: ${message.title ?? message.fallbackMessage}`,
          };

          setEvents((current) => [event, ...current]);
        },
      }, 'ui');
    });
  }, [
    messages,
    notification,
  ]);

  return (
    <Box sx={{ maxWidth: 520, padding: 4 }}>
      <Typography
        gutterBottom
        variant="h5"
      >Local notifications
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ marginBottom: 2 }}
        variant="body2"
      >
        {scenario === 'overflow'
          ? 'Send a burst to see stacked messages and an expandable overflow group.'
          : 'Send messages through the notification-ui-core transport contract.'}
      </Typography>
      <Button
        onClick={handleSendMessages}
        variant="contained"
      >
        {scenario === 'overflow' ? 'Send eight messages' : 'Send messages'}
      </Button>
      <Box
        aria-live="polite"
        component="output"
        sx={{ display: 'block', marginTop: 2 }}
      >
        {events.slice(0, 5).map(({ id, text }) => (
          <Typography
            color="text.secondary"
            key={id}
            variant="caption"
          >
            {text}<br />
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
