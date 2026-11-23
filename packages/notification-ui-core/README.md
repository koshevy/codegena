# `@codegena/notification-ui-core`

React context for delivering notifications through replaceable transports. Consumers use `useNotification()` to obtain a facade that routes messages to UI, agent, or backend transports without importing a notification engine.

```tsx
import {
  NotificationProvider,
  useNotification,
  type NotificationTransport,
} from '@codegena/notification-ui-core';

function SaveButton() {
  const notifications = useNotification();

  return (
    <button onClick={() => notifications.notify(
      { fallbackMessage: 'Saved' },
      {
        onClosed: () => undefined,
        onShowingAnimationComplete: () => undefined,
      },
      'ui',
    )}>
      Save
    </button>
  );
}

export function App({ uiTransport }: { uiTransport: NotificationTransport }) {
  return (
    <NotificationProvider transport={[uiTransport]}>
      <SaveButton />
    </NotificationProvider>
  );
}
```
