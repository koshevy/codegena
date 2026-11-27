import { clientShellBuildHeader } from '@codegena/pwa/common';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import type { LandingBuild } from './landing-build';

const emptyRoot = '<div id="root"></div>';

export function createApp({
  buildId,
  clientRoot,
  indexHtml,
  renderLanding,
}: LandingBuild): Hono {
  if (!indexHtml.includes(emptyRoot)) {
    throw new Error('The landing HTML has no empty React root.');
  }

  const app = new Hono({ strict: false });
  const documentHtml = indexHtml.replace(
    '<body class="GlobalCSS__preloading">',
    '<body>',
  );

  app.get('/', async (context) => {
    context.header('Vary', clientShellBuildHeader);

    if (context.req.header(clientShellBuildHeader) === buildId) {
      return context.html(documentHtml, { headers: { 'cache-control': 'no-store' } });
    }

    const markup = await renderLanding(context.req.raw);
    const html = documentHtml.replace(
      emptyRoot,
      () => `<div id="root" data-server-rendered="true">${markup}</div>`,
    );

    return context.html(html, { headers: { 'cache-control': 'no-cache' } });
  });

  app.use('*', serveStatic({
    root: clientRoot,
    onFound: (_path, context) => {
      context.header('cache-control', 'public, max-age=0');
    },
  }));

  app.get('/docs/*', (context) => context.html(indexHtml));
  app.get('/playground/:specUrl?', (context) => context.html(indexHtml));

  return app;
}
