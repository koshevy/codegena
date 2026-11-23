import { fileURLToPath } from 'node:url';
import type { ViteDevServer } from 'vite';

export async function loadBrowserService(
  server: ViteDevServer,
  module: string,
): Promise<string> {
  const resolved = await server.pluginContainer.resolveId(
    module,
    fileURLToPath(new URL('preview.ts', import.meta.url)),
  );

  if (!resolved) {
    throw new Error(`Unable to resolve browser service: ${module}`);
  }

  const transformed = await server.transformRequest(`/@fs/${resolved.id}`);

  if (!transformed) {
    throw new Error(`Unable to load browser service: ${module}`);
  }

  return transformed.code;
}
