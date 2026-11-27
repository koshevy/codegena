/**
 * Feature logic using the standard Fetch API. defineServiceWorkerRoute adapts
 * this handler to the companion's message transport.
 */
export type ServiceWorkerHttpHandler = (
  request: Request,
) => Response | Promise<Response>;
