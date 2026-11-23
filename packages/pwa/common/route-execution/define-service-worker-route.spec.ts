import { defineServiceWorkerRoute } from './define-service-worker-route';
import { mapRequestToServiceWorkerRouteRequest }
  from './map-request-to-service-worker-route-request';

describe('defineServiceWorkerRoute', () => {
  it('gives a native Request to the feature and preserves its Response', async () => {
    const route = defineServiceWorkerRoute(async (incoming) => (
      Response.json({
        body: await incoming.text(),
        contentType: incoming.headers.get('content-type'),
        method: incoming.method,
        url: incoming.url,
      }, { status: 201 })
    ));

    const request = await mapRequestToServiceWorkerRouteRequest(new Request(
      'https://codegena.example/api/history?limit=5',
      {
        body: 'Pet',
        headers: { 'content-type': 'text/plain' },
        method: 'POST',
      },
    ));

    const result = await route(request);
    const response = new Response(result.body, result);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      body: 'Pet',
      contentType: 'text/plain',
      method: 'POST',
      url: 'https://codegena.example/api/history?limit=5',
    });
  });

  it('supports a GET handler with a binary response', async () => {
    const route = defineServiceWorkerRoute(() => (
      new Response(new Uint8Array([0, 127, 255]), {
        headers: { 'content-type': 'application/octet-stream' },
        status: 206,
      })
    ));

    const request = await mapRequestToServiceWorkerRouteRequest(
      new Request('https://codegena.example/api/history'),
    );

    const result = await route(request);
    const expectedBody = new Uint8Array([0, 127, 255]);

    expect(result.body).toEqual(expectedBody.buffer);
    expect(result.headers).toContainEqual(['content-type', 'application/octet-stream']);
    expect(result.status).toBe(206);
  });

  it('propagates feature errors to the companion listener', async () => {
    const route = defineServiceWorkerRoute(() => {
      throw new Error('History is unavailable.');
    });

    const request = await mapRequestToServiceWorkerRouteRequest(
      new Request('https://codegena.example/api/history'),
    );

    await expect(route(request)).rejects.toThrow('History is unavailable.');
  });
});
