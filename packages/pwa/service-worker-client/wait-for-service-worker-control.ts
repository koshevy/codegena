/**
 * Await this worker's activation and control of the current page. An existing
 * controller can belong to the version being replaced during an update.
 */
export async function waitForServiceWorkerControl(worker: ServiceWorker): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const timeout = AbortSignal.timeout(10_000);
  const container = navigator.serviceWorker;

  const checkControl = (): void => {
    if (worker.state === 'redundant') {
      reject(new Error('The PWA Service Worker could not activate.'));

      return;
    }

    const hasControl = worker.state === 'activated' && container.controller === worker;

    if (hasControl) {
      resolve();
    }
  };

  const handleTimeout = (): void => {
    reject(new Error('Timed out waiting for PWA Service Worker control.'));
  };

  worker.addEventListener('statechange', checkControl);
  container.addEventListener('controllerchange', checkControl);
  timeout.addEventListener('abort', handleTimeout, { once: true });
  checkControl();

  try {
    await promise;
  }
  finally {
    worker.removeEventListener('statechange', checkControl);
    container.removeEventListener('controllerchange', checkControl);
    timeout.removeEventListener('abort', handleTimeout);
  }
}
