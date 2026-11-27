import { useNotification } from '@codegena/notification-ui-core';
import { act, renderHook, screen } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';

import { NotistackNotificationProvider } from './notistack-notification-provider';

function Wrapper({ children }: PropsWithChildren): ReactElement {
  return (
    <NotistackNotificationProvider>{children}</NotistackNotificationProvider>
  );
}

function LimitedWrapper({ children }: PropsWithChildren): ReactElement {
  return (
    <NotistackNotificationProvider maxVisible={3}>
      {children}
    </NotistackNotificationProvider>
  );
}

describe('NotistackNotificationProvider', () => {
  it('renders messages sent through the shared notification facade', async () => {
    const { result } = renderHook(useNotification, { wrapper: Wrapper });

    act(() => {
      result.current.notify(
        { fallbackMessage: 'Types generated', severity: 'success' },
        {
          onClosed: jest.fn(),
          onShowingAnimationComplete: jest.fn(),
        },
        'ui',
      );
    });

    expect(await screen.findByText('Types generated')).not.toBeNull();
    expect(screen.queryByText('success')).toBeNull();
    expect(screen.getByText('Types generated').closest('.NotificationCard__heading'))
      .not.toBeNull();
  });

  it('keeps repeated delivery of the same message in one card', async () => {
    const { result } = renderHook(useNotification, { wrapper: LimitedWrapper });

    act(() => {
      for (let index = 0; index < 6; index += 1) {
        result.current.notify(
          { fallbackMessage: 'Warning copied', severity: 'success' },
          {
            onClosed: jest.fn(),
            onShowingAnimationComplete: jest.fn(),
          },
          'ui',
        );
      }
    });

    expect(await screen.findByText('Warning copied')).not.toBeNull();
    expect(screen.getAllByText('Warning copied')).toHaveLength(1);
    expect(screen.queryByText('more notifications')).toBeNull();
  });

  it('shows an expandable summary when the visible stack is full', async () => {
    const { result } = renderHook(useNotification, { wrapper: LimitedWrapper });

    act(() => {
      for (let index = 1; index <= 4; index += 1) {
        result.current.notify(
          { fallbackMessage: `Message ${index}` },
          {
            onClosed: jest.fn(),
            onShowingAnimationComplete: jest.fn(),
          },
          'ui',
        );
      }
    });

    expect(await screen.findByText('2 more notifications')).not.toBeNull();
  });
});
