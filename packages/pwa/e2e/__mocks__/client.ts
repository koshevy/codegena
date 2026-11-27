import {
  initializeServiceWorker,
  registerServiceWorkerRoute,
} from '@codegena/pwa';
import {
  type CompanionExecutionRequest,
  exchangeWorkerMessage,
} from '@codegena/pwa/common';

export async function activateHistoryRoute(buildId = 'test-build-1'): Promise<void> {
  await initializeServiceWorker(buildId);

  await registerServiceWorkerRoute({
    httpMethod: 'POST',
    moduleUrl: '/history-route.js',
    routeBaseUrl: '/services/history',
  });
}

export async function executeOpaqueExample(): Promise<unknown> {
  const worker = new SharedWorker('/service-worker-companion.js', {
    name: 'codegena-pwa-service-layer',
    type: 'module',
  });
  const url = new URL('/add.js', globalThis.location.origin);

  const request: CompanionExecutionRequest = {
    moduleUrl: url.href,
    params: [17, 25],
  };

  try {
    return await exchangeWorkerMessage(worker.port, request);
  }
  finally {
    worker.port.close();
  }
}
