import { resolve } from 'node:path';

export const environment = {
  clientRoot: resolve(__dirname, '../landing-mf-host'),
  hostname: process.env['HOST'] ?? '127.0.0.1',
  port: Number(process.env['PORT'] ?? 8104),
  rendererPath: resolve(__dirname, '../landing-mf-host-renderer/renderer.cjs'),
};
