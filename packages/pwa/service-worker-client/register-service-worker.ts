import { waitForServiceWorkerControl } from './wait-for-service-worker-control';

/**
 * Activate the central worker for this build without starting a companion.
 */
export async function registerServiceWorker(buildId: string): Promise<ServiceWorker> {
  if (!buildId.trim()) {
    throw new TypeError('A Service Worker build ID is required.');
  }

  const params = new URLSearchParams({ buildId });
  const uniqueQueryUrlPart = params.toString();

  // Approved exception: only the encoded build ID varies; the worker path stays local.
  // eslint-disable-next-line browser-security/no-dynamic-service-worker-url
  const registration = await navigator.serviceWorker.register(
    `/service-worker.js?${uniqueQueryUrlPart}`,
    { type: 'module', updateViaCache: 'none' },
  );

  const worker = registration.installing ?? registration.waiting ?? registration.active;

  if (!worker) {
    throw new Error('The PWA Service Worker registration has no worker.');
  }

  const workerUrl = new URL(worker.scriptURL);
  const isRequestedBuild = workerUrl.pathname === '/service-worker.js'
    && workerUrl.searchParams.get('buildId') === buildId;

  if (!isRequestedBuild) {
    throw new Error('The PWA build was superseded during initialization.');
  }

  await waitForServiceWorkerControl(worker);

  return worker;
}
