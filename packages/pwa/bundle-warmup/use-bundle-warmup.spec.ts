/**
 * @jest-environment jsdom
 */
import { BundleWarmupContext } from '@codegena/pwa/bundle-warmup-context';
import { registerServiceWorker } from '@codegena/pwa/service-worker-client';
import { act, renderHook } from '@testing-library/react';
import {
  createElement,
  type PropsWithChildren,
  type ReactElement,
  StrictMode,
} from 'react';

import { useBundleWarmup } from './use-bundle-warmup';

jest.mock('@codegena/pwa/service-worker-client');

const workerConfig = {
  buildId: 'build-1',
  canWarmBundles: true,
  manifestPath: 'assets/warmup.json',
};
const warmAfterPaintedGroups = ['navigation'] as const;
const extrasGroups = {
  landingReady: ['search', 'nebula'],
  playgroundReady: ['examples'],
} as const;

function WarmupOwner({ children }: PropsWithChildren): ReactElement {
  const renderedProvider = createElement(
    BundleWarmupContext.Provider,
    { value: { ...workerConfig } },
    children,
  );

  return createElement(StrictMode, null, renderedProvider);
}

function createWorker(): ServiceWorker {
  return Object.assign(new EventTarget(), {
    onerror: null,
    onstatechange: null,
    postMessage: jest.fn(),
    scriptURL: 'https://codegena.example/service-worker.js?buildId=build-1',
    state: 'activated' as const,
  });
}

describe('useBundleWarmup', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('warms navigation after paint and sends each extras turn once', async () => {
    const worker = createWorker();
    const registration = Promise.withResolvers<ServiceWorker>();

    jest.mocked(registerServiceWorker).mockReturnValue(registration.promise);

    const {
      rerender,
      result,
    } = renderHook(
      ({ turn }: { turn?: string }) => useBundleWarmup({
        warmAfterPaintedGroups: ['navigation'],
        extrasGroups: { ...extrasGroups },
        currentExtrasTurn: turn,
      }),
      { initialProps: {}, wrapper: WarmupOwner },
    );

    expect(result.current.hasPainted).toBe(false);
    expect(registerServiceWorker).not.toHaveBeenCalled();

    rerender({ turn: 'landingReady' });

    await act(async () => jest.advanceTimersToNextFrame());

    expect(result.current.hasPainted).toBe(false);
    expect(registerServiceWorker).not.toHaveBeenCalled();

    await act(async () => jest.advanceTimersToNextFrame());

    expect(result.current.hasPainted).toBe(true);
    expect(registerServiceWorker).toHaveBeenCalledTimes(1);
    expect(worker.postMessage).not.toHaveBeenCalled();

    rerender({ turn: 'playgroundReady' });
    rerender({ turn: 'landingReady' });

    expect(result.current.hasPainted).toBe(true);

    await act(async () => registration.resolve(worker));

    expect(worker.postMessage).toHaveBeenCalledTimes(3);
    expect(worker.postMessage).toHaveBeenNthCalledWith(1, {
      buildId: 'build-1',
      groups: ['navigation'],
      manifestPath: 'assets/warmup.json',
      type: 'warm-bundles',
    }, []);
    expect(worker.postMessage).toHaveBeenNthCalledWith(2, {
      buildId: 'build-1',
      groups: ['search', 'nebula'],
      manifestPath: 'assets/warmup.json',
      type: 'warm-bundles',
    }, []);
    expect(worker.postMessage).toHaveBeenNthCalledWith(3, {
      buildId: 'build-1',
      groups: ['examples'],
      manifestPath: 'assets/warmup.json',
      type: 'warm-bundles',
    }, []);
  });

  it('sends more than eight groups in ordered worker requests', async () => {
    const worker = createWorker();
    const groups = Array.from({ length: 9 }, (_, index) => `group-${index + 1}`);

    jest.mocked(registerServiceWorker).mockResolvedValue(worker);

    renderHook(() => useBundleWarmup({
      warmAfterPaintedGroups: groups,
      extrasGroups,
    }), { wrapper: WarmupOwner });

    await act(async () => {
      jest.advanceTimersToNextFrame();
      jest.advanceTimersToNextFrame();
    });

    expect(worker.postMessage).toHaveBeenCalledTimes(2);
    expect(worker.postMessage).toHaveBeenNthCalledWith(1, expect.objectContaining({
      groups: groups.slice(0, 8),
    }), []);
    expect(worker.postMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      groups: [groups[8]],
    }), []);
  });

  it('drops requests if its owner unmounts during worker activation', async () => {
    const worker = createWorker();
    const registration = Promise.withResolvers<ServiceWorker>();

    jest.mocked(registerServiceWorker).mockReturnValue(registration.promise);

    const { unmount } = renderHook(() => useBundleWarmup({
      warmAfterPaintedGroups,
      extrasGroups,
      currentExtrasTurn: 'landingReady',
    }), { wrapper: WarmupOwner });

    await act(async () => {
      jest.advanceTimersToNextFrame();
      jest.advanceTimersToNextFrame();
    });

    expect(registerServiceWorker).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => registration.resolve(worker));

    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('skips registration if its owner unmounts before the client loads', async () => {
    const { unmount } = renderHook(() => useBundleWarmup({
      warmAfterPaintedGroups,
      extrasGroups,
    }), { wrapper: WarmupOwner });

    act(() => {
      jest.advanceTimersToNextFrame();
      jest.advanceTimersToNextFrame();
    });

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(registerServiceWorker).not.toHaveBeenCalled();
  });

  it('waits for paint again when a route returns before the next frame', () => {
    const {
      rerender,
      result,
    } = renderHook(({ group }) => useBundleWarmup({
      warmAfterPaintedGroups: [group],
      extrasGroups,
    }), { initialProps: { group: 'navigation' } });

    act(() => {
      jest.advanceTimersToNextFrame();
      jest.advanceTimersToNextFrame();
    });

    expect(result.current.hasPainted).toBe(true);

    rerender({ group: 'embedded-navigation' });
    rerender({ group: 'navigation' });

    expect(result.current.hasPainted).toBe(false);
  });
});
