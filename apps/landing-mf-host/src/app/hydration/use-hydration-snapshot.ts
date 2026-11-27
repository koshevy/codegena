import { useSyncExternalStore } from 'react';

const unsubscribeNoop = (): undefined => undefined;
const subscribeToSnapshot = (): (() => void) => unsubscribeNoop;

/**
 * Use the same snapshot in the server render and the first hydration render.
 * React reads the browser snapshot after hydration.
 */
export function useHydrationSnapshot<Value>(
  readBrowserValue: () => Value,
  readServerValue: () => Value,
): Value {
  return useSyncExternalStore(subscribeToSnapshot, readBrowserValue, readServerValue);
}
