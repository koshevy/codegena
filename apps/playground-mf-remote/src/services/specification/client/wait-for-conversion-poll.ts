/**
 * Back off between status requests without delaying route cancellation.
 */
export function waitForConversionPoll(signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();

  return new Promise((resolve, reject) => {
    const cancel = (): void => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, 200);

    signal.addEventListener('abort', cancel, { once: true });
  });
}
