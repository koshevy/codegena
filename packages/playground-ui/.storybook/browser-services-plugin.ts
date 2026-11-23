import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

import { loadBrowserService } from './load-browser-service.ts';

const browserServiceModules = {
  'service-worker.js': '@codegena/pwa/assets/service-worker.esm.js',
  'service-worker-companion.js': '@codegena/pwa/assets/service-worker-companion.esm.js',
  'graph-search-api.js': '@codegena/graph-search-core/api',
} as const;

/**
 * Serve the host's fixed PWA URLs through Vite in development and emit them as
 * module entry chunks in the Storybook build. The search API keeps its default export.
 */
export function browserServicesPlugin(): Plugin {
  return {
    name: 'playground-browser-services',
    applyToEnvironment: (environment) => environment.name === 'client',
    config() {
      const buildId = process.env['CODEGENA_BUILD_ID'] ?? randomUUID();

      return { define: { CODEGENA_BUILD_ID: JSON.stringify(buildId) } };
    },
    async buildStart() {
      if (this.environment.mode !== 'build') {
        return;
      }

      const emitServiceEntry = async (
        [fileName, module]: [string, string],
      ): Promise<void> => {
        const resolved = await this.resolve(
          module,
          fileURLToPath(new URL('preview.ts', import.meta.url)),
        );

        if (!resolved) {
          throw new Error(`Unable to resolve browser service: ${module}`);
        }

        this.emitFile({
          type: 'chunk', fileName, id: resolved.id, preserveSignature: 'strict',
        });
      };

      await Promise.all(Object.entries(browserServiceModules).map((entry) => (
        emitServiceEntry(entry)
      )));
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = request.url?.split('?')[0]?.slice(1) ?? '';
        const module = Object.entries(browserServiceModules).find(([fileName]) => (
          fileName === path
        ))?.[1];

        if (!module) {
          next();

          return;
        }

        try {
          const code = await loadBrowserService(server, module);

          response.writeHead(200, {
            'cache-control': 'no-store',
            'content-type': 'text/javascript',
          });
          response.end(code);
        }
        catch (error) {
          next(error);
        }
      });
    },
  };
}
