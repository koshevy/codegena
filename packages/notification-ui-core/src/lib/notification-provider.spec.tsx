import { renderHook } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';

import { NotificationProvider } from './notification-provider';
import type { NotificationTransport } from './notification-transport';
import { useNotification } from './use-notification';
import { useOptionalNotification } from './use-optional-notification';

function createTransport(type: 'ui' | 'agent'): NotificationTransport {
  return {
    close: jest.fn(),
    closeAll: jest.fn(),
    getType: () => type,
    notify: jest.fn(() => `${type}-message`),
    revoke: jest.fn(async () => {
      // This transport has no queued notifications to revoke.
    }),
  };
}

describe('NotificationProvider', () => {
  it('routes messages through the selected transport type', () => {
    const ui = createTransport('ui');
    const agent = createTransport('agent');

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <NotificationProvider transport={[ui, agent]}>
        {children}
      </NotificationProvider>
    );

    const { result } = renderHook(useNotification, { wrapper });
    const message = { fallbackMessage: 'Saved' };
    const options = {
      onClosed: jest.fn(),
      onShowingAnimationComplete: jest.fn(),
    };

    expect(result.current.notify(message, options, 'ui')).toEqual({
      ui: ['ui-message'],
    });
    expect(ui.notify).toHaveBeenCalledWith(message, options);
    expect(agent.notify).not.toHaveBeenCalled();
  });

  it('uses a replacement transport after the provider changes', () => {
    const first = createTransport('ui');
    const next = createTransport('ui');
    let transports: NotificationTransport[] = [first];

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <NotificationProvider transport={transports}>
        {children}
      </NotificationProvider>
    );

    const { result, rerender } = renderHook(useNotification, { wrapper });
    const message = { fallbackMessage: 'Updated' };
    const options = {
      onClosed: jest.fn(),
      onShowingAnimationComplete: jest.fn(),
    };

    result.current.notify(message, options);
    transports = [next];
    rerender();
    result.current.notify(message, options);

    expect(first.notify).toHaveBeenCalledTimes(1);
    expect(next.notify).toHaveBeenCalledTimes(1);
  });

  it('fails clearly outside a provider', () => {
    expect(() => renderHook(useNotification)).toThrow(
      'useNotification requires a NotificationProvider.',
    );
  });

  it('returns no facade outside a provider when notifications are optional', () => {
    const { result } = renderHook(useOptionalNotification);

    expect(result.current).toBeNull();
  });

  it('returns a facade from an available optional provider', () => {
    const ui = createTransport('ui');

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <NotificationProvider transport={[ui]}>
        {children}
      </NotificationProvider>
    );

    const { result } = renderHook(useOptionalNotification, { wrapper });

    expect(result.current).not.toBeNull();
    expect(result.current?.notify({ fallbackMessage: 'Copied' }, {
      onClosed: jest.fn(),
      onShowingAnimationComplete: jest.fn(),
    }, 'ui')).toEqual({ ui: ['ui-message'] });
  });
});
