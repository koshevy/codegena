import { registerServiceWorker } from './register-service-worker';
import { requestServiceWorkerCompanionConnection }
  from './request-service-worker-companion-connection';

/**
 * Register the central worker, await page control, and connect its companion.
 * Use one ID per production build and a fresh dev ID on each page load.
 * A changed ID replaces both workers within the existing Service Worker scope.
 */
export async function initializeServiceWorker(buildId: string): Promise<void> {
  const worker = await registerServiceWorker(buildId);
  const params = new URLSearchParams({ buildId });
  const uniqueQueryUrlPart = params.toString();

  await requestServiceWorkerCompanionConnection(
    worker,
    `/service-worker-companion.js?${uniqueQueryUrlPart}`,
  );

  if (navigator.serviceWorker.controller !== worker) {
    throw new Error('The PWA build was superseded during initialization.');
  }
}
