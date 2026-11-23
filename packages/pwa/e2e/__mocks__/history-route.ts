import { defineServiceWorkerRoute } from '@codegena/pwa/common';

const journal = { visits: 0 };

const historyRoute = defineServiceWorkerRoute(async (request) => {
  const url = new URL(request.url);

  if (url.searchParams.has('visit')) {
    journal.visits += 1;

    return Response.json(journal);
  }

  if (url.searchParams.has('fail')) {
    throw new Error('History is unavailable.');
  }

  if (url.searchParams.has('missing')) {
    return Response.json({ error: 'No visit found.' }, { status: 404 });
  }

  if (url.searchParams.has('binary')) {
    return new Response(new Uint8Array([0, 127, 255]), {
      headers: { 'content-type': 'application/octet-stream' },
      status: 206,
    });
  }

  if (url.searchParams.has('echo')) {
    const body = await request.text();

    return Response.json({
      body,
      id: url.searchParams.get('id'),
      method: request.method,
      worker: globalThis.constructor.name,
    });
  }

  return Response.json({
    path: url.pathname,
    service: 'history',
  });
});

export default historyRoute;
