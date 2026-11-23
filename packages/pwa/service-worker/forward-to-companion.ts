import type { CompanionExecutionRequest } from '@codegena/pwa/common';
import {
  companionExecutionResponseSchema,
  exchangeWorkerMessage,
  mapRequestToServiceWorkerRouteRequest,
  serviceWorkerRouteResponseSchema,
} from '@codegena/pwa/common';

export async function forwardToCompanion(
  port: MessagePort | undefined,
  moduleUrl: string,
  request: Request,
): Promise<Response> {
  if (!port) {
    return Response.json({ error: 'The service companion is not connected.' }, {
      status: 503,
    });
  }

  const routeRequest = await mapRequestToServiceWorkerRouteRequest(request);

  const execution: CompanionExecutionRequest = {
    moduleUrl,
    params: [routeRequest],
  };

  const result = await exchangeWorkerMessage(
    port,
    execution,
    routeRequest.body ? [routeRequest.body] : [],
  );

  const reply = companionExecutionResponseSchema.parse(result);

  if ('error' in reply) {
    return Response.json({ error: reply.error }, { status: 500 });
  }

  const response = serviceWorkerRouteResponseSchema.parse(reply.result);

  return new Response(response.body, response);
}
