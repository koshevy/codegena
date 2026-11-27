/**
 * Send opaque data and await a reply on a fresh channel. The reply port is the
 * first transferred port; caller-provided transfers follow it. This utility
 * handles channel cleanup and timeout without interpreting request or reply data.
 */
export async function exchangeWorkerMessage(
  target: MessagePort | ServiceWorker,
  message: unknown,
  transfer: Transferable[] = [],
): Promise<unknown> {
  const channel = new MessageChannel();
  const timeout = AbortSignal.timeout(10_000);
  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

  const handleAbort = (): void => reject(new Error('PWA worker request timed out.'));

  timeout.addEventListener('abort', handleAbort, { once: true });

  channel.port1.onmessage = (event: MessageEvent<unknown>) => resolve(event.data);
  channel.port1.onmessageerror = () => reject(new Error('Invalid PWA worker reply.'));

  try {
    target.postMessage(message, [channel.port2, ...transfer]);

    return await promise;
  }
  finally {
    timeout.removeEventListener('abort', handleAbort);
    channel.port1.close();
    channel.port2.close();
  }
}
