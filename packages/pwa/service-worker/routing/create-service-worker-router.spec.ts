import type { ServiceWorkerCompanionConnection } from '@codegena/pwa/common';
import type { Hono } from 'hono';

import { createServiceWorkerRouter } from './create-service-worker-router';

const origin = 'https://codegena.example';
const route = {
  httpMethod: 'POST',
  moduleUrl: '/modules/history.js',
  routeBaseUrl: '/services/history',
};

function createRouter(companion: ServiceWorkerCompanionConnection = {}): Hono {
  return createServiceWorkerRouter({
    companion,
    origin,
  });
}

function registerRoute(app: Hono, value: unknown = route): Response | Promise<Response> {
  return app.request(`${origin}/_register`, {
    body: JSON.stringify(value),
    headers: { 'content-type': 'application/json', origin },
    method: 'POST',
  });
}

describe('Service Worker router', () => {
  it('attaches a route after Hono has handled its first request', async () => {
    const app = createRouter();
    const before = await app.request(`${origin}/_register`, { method: 'GET' });

    expect(before.status).toBe(405);

    const registration = await registerRoute(app);

    expect(registration.status).toBe(200);

    const response = await app.request(`${origin}/services/history`, {
      method: 'POST',
    });

    expect(response.status).toBe(503);
  });

  it('accepts the same normalized route without adding another handler', async () => {
    const app = createRouter();
    const absoluteRoute = {
      ...route,
      moduleUrl: `${origin}/modules/history.js`,
      routeBaseUrl: '/services/history',
    };

    await registerRoute(app);

    const response = await registerRoute(app, absoluteRoute);

    expect(response.status).toBe(200);
    expect(app.routes.filter(({ method, path }) => (
      method === 'POST' && path === '/services/history'
    ))).toHaveLength(1);
  });

  it('rejects a different module for an already registered method and path', async () => {
    const app = createRouter();

    await registerRoute(app);

    const response = await registerRoute(app, {
      ...route,
      moduleUrl: '/modules/another-history.js',
    });

    expect(response.status).toBe(409);
  });

  it('limits registration request size before parsing', async () => {
    const response = await registerRoute(createRouter(), {
      ...route,
      moduleUrl: 'a'.repeat(4096),
    });

    expect(response.status).toBe(413);
  });

  it('matches the literal path and HTTP method without adding a subtree', async () => {
    const app = createRouter();
    const network = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(() => Promise.resolve(new Response('network', {
        headers: { 'x-source': 'network' },
      })));

    try {
      await registerRoute(app, { ...route, routeBaseUrl: '/services/history/' });

      const matching = await app.request(`${origin}/services/history/`, {
        method: 'POST',
      });
      const withoutSlash = await app.request(`${origin}/services/history`, {
        method: 'POST',
      });
      const child = await app.request(`${origin}/services/history/child`, {
        method: 'POST',
      });
      const anotherMethod = await app.request(`${origin}/services/history/`);

      await registerRoute(app, {
        ...route,
        httpMethod: 'GET',
        routeBaseUrl: '/services/history/',
      });

      const head = await app.request(`${origin}/services/history/`, { method: 'HEAD' });

      expect(matching.status).toBe(503);
      expect(await withoutSlash.text()).toBe('network');
      expect(await child.text()).toBe('network');
      expect(await anotherMethod.text()).toBe('network');
      expect(head.headers.get('x-source')).toBe('network');
    }
    finally {
      network.mockRestore();
    }
  });

  it('allows another method on the same literal path', async () => {
    const app = createRouter();

    await registerRoute(app);

    const response = await registerRoute(app, { ...route, httpMethod: 'GET' });

    expect(response.status).toBe(200);
  });

  it.each([
    { ...route, moduleUrl: 'https://other.example/module.js' },
    { ...route, moduleUrl: '//other.example/module.js' },
    { ...route, routeBaseUrl: 'https://other.example/history' },
    { ...route, routeBaseUrl: '/_register' },
    { ...route, routeBaseUrl: '/' },
    { ...route, routeBaseUrl: '/history/*' },
    { ...route, routeBaseUrl: '/history?all=true' },
    { ...route, routeBaseUrl: '/history/%2f_register' },
    { ...route, routeBaseUrl: '/history/../other' },
    { ...route, routeBaseUrl: '/history/./other' },
    { ...route, moduleUrl: 'data:text/javascript,export default 1' },
    { ...route, httpMethod: 'CONNECT' },
    { ...route, httpMethod: 'HEAD' },
    { ...route, extra: true },
    null,
  ])('rejects invalid registration data: %j', async (value) => {
    const response = await registerRoute(createRouter(), value);

    expect(response.status).toBe(400);
  });

  it('registers module URLs without importing them in the Service Worker', async () => {
    const response = await registerRoute(createRouter(), {
      ...route,
      moduleUrl: '/modules/unknown.js',
    });

    expect(response.status).toBe(200);
  });

  it.each([
    new Request(`${origin}/_register`, {
      body: JSON.stringify(route),
      headers: {
        'content-type': 'application/json',
        'origin': 'https://other.example',
      },
      method: 'POST',
    }),
    new Request('https://other.example/_register', { method: 'POST' }),
  ])('rejects a cross-origin registration request', async (request) => {
    const response = await createRouter().request(request);

    expect(response.status).toBe(403);
  });

  it('rejects malformed JSON and unsupported content types', async () => {
    const app = createRouter();
    const malformed = await app.request(`${origin}/_register`, {
      body: '{',
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    const text = await app.request(`${origin}/_register`, {
      body: JSON.stringify(route),
      method: 'POST',
    });

    expect(malformed.status).toBe(400);
    expect(text.status).toBe(415);
  });
});
