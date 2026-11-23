import { build } from 'esbuild';
import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import { basename, join } from 'node:path';

import type { BrowserTestServer } from './browser-test-server';

export async function startBrowserServer(): Promise<BrowserTestServer> {
  const built = await build({
    bundle: true,
    entryPoints: {
      'service-worker': '@codegena/pwa/assets/service-worker.esm.js',
      'service-worker-companion': '@codegena/pwa/assets/service-worker-companion.esm.js',
      'client': join(import.meta.dirname, 'client.ts'),
      'history-route': join(import.meta.dirname, 'history-route.ts'),
      'add': join(import.meta.dirname, 'add.ts'),
    },
    format: 'esm',
    outdir: 'browser',
    platform: 'browser',
    write: false,
  });

  const scripts = new Map(built.outputFiles.map((file) => [
    `/${basename(file.path)}`,
    file.contents,
  ]));

  let assetVersion = 0;

  const server = createServer((request, response) => {
    const path = request.url?.split('?')[0] ?? '/';

    if (path === '/public-asset.js') {
      assetVersion += 1;
      response.writeHead(200, {
        'cache-control': 'public, max-age=3600',
        'content-type': 'text/javascript',
      });
      response.end(`document.body.dataset.assetVersion = "${assetVersion}";`);
      return;
    }

    const script = scripts.get(path);
    const contentType = script ? 'text/javascript' : 'text/html';

    response.writeHead(200, { 'content-type': contentType });
    response.end(script ?? '<!doctype html><title>PWA browser fixture</title>Network');
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('The browser fixture needs a TCP server address.');
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    updateWorker: () => {
      const script = scripts.get('/service-worker.js');

      if (!script) {
        throw new Error('The PWA worker bundle is missing.');
      }

      const delayedInstallation = Buffer.from([
        'self.addEventListener("install", (event) => {',
        '  event.waitUntil(new Promise((resolve) => setTimeout(resolve, 2000)));',
        '});',
      ].join('\n'));

      scripts.set('/service-worker.js', Buffer.concat([script, delayedInstallation]));
    },
    close: () => new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}
