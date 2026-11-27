import type { NotifyOptions } from '@codegena/notification-ui-core';
import type { ProviderContext } from 'notistack';

import { NotistackNotificationTransport } from './notistack-notification-transport';

function getCallback(
  value: unknown,
  name: 'onClose' | 'onEntered',
): (...args: unknown[]) => void {
  if (!value || typeof value !== 'object' || !(name in value)) {
    throw new Error(`Missing ${name} callback`);
  }

  const callback: unknown = Reflect.get(value, name);

  if (typeof callback !== 'function') {
    throw new TypeError(`Invalid ${name} callback`);
  }

  return (...args: unknown[]): void => {
    Reflect.apply(callback, undefined, args);
  };
}

function createTransport(maxVisible = 3): {
  closeSnackbar: jest.Mock;
  enqueueSnackbar: jest.Mock;
  transport: NotistackNotificationTransport;
} {
  const enqueueSnackbar = jest.fn((..._args: unknown[]) => 'key');
  const closeSnackbar = jest.fn();
  const snackbar: ProviderContext = { closeSnackbar, enqueueSnackbar };
  const transport = new NotistackNotificationTransport(snackbar, maxVisible);

  return { closeSnackbar, enqueueSnackbar, transport };
}

function createOptions(): NotifyOptions {
  return {
    onClosed: jest.fn(),
    onShowingAnimationComplete: jest.fn(),
  };
}

describe('NotistackNotificationTransport', () => {
  it('delivers a visible message and reports its lifecycle', () => {
    const { enqueueSnackbar, transport } = createTransport();
    const options = createOptions();
    const id = transport.notify({ fallbackMessage: 'Saved' }, options);

    expect(transport.getType()).toBe('ui');
    expect(enqueueSnackbar).toHaveBeenCalledTimes(1);
    expect(enqueueSnackbar.mock.calls[0]?.[0]).toMatchObject({ key: id });

    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onEntered')();
    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onClose')(null, 'timeout');

    expect(options.onShowingAnimationComplete).toHaveBeenCalledTimes(1);
    expect(options.onClosed).toHaveBeenCalledWith('timeout');
  });

  it('suppresses an active duplicate regardless of body and actions', () => {
    const { enqueueSnackbar, transport } = createTransport();
    const firstOptions = createOptions();
    const duplicateOptions = createOptions();
    const message = { fallbackMessage: 'Saved', title: 'Document' };
    const firstId = transport.notify(message, firstOptions);
    const duplicateId = transport.notify({
      ...message,
      actions: [{ title: 'Open document' }],
      message: 'A different rich body',
      severity: 'warning',
    }, duplicateOptions);

    expect(duplicateId).toBe(firstId);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(1);

    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onEntered')();

    expect(firstOptions.onShowingAnimationComplete).toHaveBeenCalledTimes(1);
    expect(duplicateOptions.onShowingAnimationComplete).toHaveBeenCalledTimes(1);

    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onClose')(null, 'timeout');

    expect(firstOptions.onClosed).toHaveBeenCalledWith('timeout');
    expect(duplicateOptions.onClosed).toHaveBeenCalledWith('timeout');

    const nextId = transport.notify(message, createOptions());

    expect(nextId).not.toBe(firstId);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(2);
  });

  it('distinguishes both title and fallback message', () => {
    const { enqueueSnackbar, transport } = createTransport(5);
    const options = createOptions();

    transport.notify({ fallbackMessage: 'Saved', title: 'Document' }, options);
    transport.notify({ fallbackMessage: 'Updated', title: 'Document' }, options);
    transport.notify({ fallbackMessage: 'Saved', title: 'Workspace' }, options);

    expect(enqueueSnackbar).toHaveBeenCalledTimes(3);
  });

  it('allows the same message while an earlier copy is closing', () => {
    const { enqueueSnackbar, transport } = createTransport();
    const message = { fallbackMessage: 'Saved', title: 'Document' };
    const firstId = transport.notify(message, createOptions());

    transport.getActionGrip(firstId).close();

    const nextId = transport.notify(message, createOptions());

    expect(nextId).not.toBe(firstId);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(2);

    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onClose')(null, 'instructed');

    expect(transport.notify(message, createOptions())).toBe(nextId);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(2);
  });

  it('groups overflow while keeping individual messages addressable', async () => {
    const { closeSnackbar, enqueueSnackbar, transport } = createTransport();
    const options = Array.from({ length: 4 }, createOptions);
    const ids = options.map((item, index) => transport.notify({
      fallbackMessage: `Message ${index + 1}`,
    }, item));

    expect(enqueueSnackbar).toHaveBeenCalledTimes(3);
    expect(transport.getGroupedSnapshot().map(({ id }) => id)).toEqual(ids.slice(2));

    getCallback(enqueueSnackbar.mock.calls[2]?.[0], 'onEntered')();

    expect(options[2]?.onShowingAnimationComplete).toHaveBeenCalledTimes(1);
    expect(options[3]?.onShowingAnimationComplete).toHaveBeenCalledTimes(1);

    await transport.revoke(ids[2] ?? 'missing');

    expect(transport.getGroupedSnapshot().map(({ id }) => id)).toEqual(ids.slice(3));
    expect(options[2]?.onClosed).toHaveBeenCalledWith('revoke');

    transport.closeGrouped();

    expect(options[3]?.onClosed).toHaveBeenCalledWith('dismiss');
    expect(transport.getGroupedSnapshot()).toEqual([]);
    expect(closeSnackbar).toHaveBeenCalledTimes(1);
  });

  it('closes one grouped notification without closing the others', () => {
    const { transport } = createTransport();

    transport.notify({ fallbackMessage: 'First' }, createOptions());
    transport.notify({ fallbackMessage: 'Second' }, createOptions());

    transport.notify({ fallbackMessage: 'Third' }, createOptions());

    const nextGroupedId = transport.notify(
      { fallbackMessage: 'Fourth' },
      createOptions(),
    );

    transport.close();

    expect(transport.getGroupedSnapshot().map(({ id }) => id)).toEqual([nextGroupedId]);
  });

  it('suppresses grouped duplicates and shares their lifecycle', () => {
    const { enqueueSnackbar, transport } = createTransport();
    const groupedOptions = createOptions();
    const duplicateOptions = createOptions();
    const lateDuplicateOptions = createOptions();

    transport.notify({ fallbackMessage: 'First' }, createOptions());
    transport.notify({ fallbackMessage: 'Second' }, createOptions());

    const groupedId = transport.notify({
      fallbackMessage: 'Saved',
      title: 'Document',
    }, groupedOptions);

    const duplicateId = transport.notify({
      actions: [{ title: 'Undo' }],
      fallbackMessage: 'Saved',
      message: 'Another body',
      title: 'Document',
    }, duplicateOptions);

    expect(duplicateId).toBe(groupedId);
    expect(transport.getGroupedSnapshot()).toHaveLength(1);
    expect(enqueueSnackbar).toHaveBeenCalledTimes(3);

    getCallback(enqueueSnackbar.mock.calls[2]?.[0], 'onEntered')();

    expect(groupedOptions.onShowingAnimationComplete).toHaveBeenCalledTimes(1);
    expect(duplicateOptions.onShowingAnimationComplete).toHaveBeenCalledTimes(1);

    transport.notify({
      fallbackMessage: 'Saved',
      title: 'Document',
    }, lateDuplicateOptions);

    expect(lateDuplicateOptions.onShowingAnimationComplete).toHaveBeenCalledTimes(1);
    expect(transport.getGroupedSnapshot()).toHaveLength(1);

    transport.closeGrouped();

    expect(groupedOptions.onClosed).toHaveBeenCalledWith('dismiss');
    expect(duplicateOptions.onClosed).toHaveBeenCalledWith('dismiss');
    expect(lateDuplicateOptions.onClosed).toHaveBeenCalledWith('dismiss');
  });

  it('ignores a stale group close after a new group appears', async () => {
    const { enqueueSnackbar, transport } = createTransport();

    transport.notify({ fallbackMessage: 'First' }, createOptions());
    transport.notify({ fallbackMessage: 'Second' }, createOptions());

    const firstGroupedId = transport.notify(
      { fallbackMessage: 'Third' },
      createOptions(),
    );

    await transport.revoke(firstGroupedId);

    const nextGroupedId = transport.notify(
      { fallbackMessage: 'Fourth' },
      createOptions(),
    );

    getCallback(enqueueSnackbar.mock.calls[2]?.[0], 'onClose')();

    expect(transport.getGroupedSnapshot().map(({ id }) => id)).toEqual([nextGroupedId]);

    transport.closeGrouped();

    expect(transport.getGroupedSnapshot()).toEqual([]);
  });

  it('closes a visible notification through its action grip', () => {
    const { closeSnackbar, enqueueSnackbar, transport } = createTransport();
    const options = createOptions();
    const id = transport.notify({ fallbackMessage: 'Review' }, options);

    transport.getActionGrip(id).close();

    expect(closeSnackbar).toHaveBeenCalledWith(id);

    getCallback(enqueueSnackbar.mock.calls[0]?.[0], 'onClose')(null, 'instructed');

    expect(options.onClosed).toHaveBeenCalledWith('dismiss');
  });
});
