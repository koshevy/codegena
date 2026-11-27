import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import type { LandingBuild } from './landing-build';

interface LandingBuildPaths {
  clientRoot: string;
  rendererPath: string;
}

interface LandingRenderer {
  createLandingRenderer: (buildId: string) => LandingBuild['renderLanding'];
  warmupManifestPath: string;
}

function getBuildId(manifest: unknown): string {
  if (typeof manifest === 'object'
    && manifest !== null
    && 'buildId' in manifest
    && typeof manifest.buildId === 'string'
    && manifest.buildId !== '') {
    return manifest.buildId;
  }

  throw new Error('The landing bundle manifest has no build ID.');
}

function isLandingRenderer(value: unknown): value is LandingRenderer {
  return typeof value === 'object'
    && value !== null
    && 'createLandingRenderer' in value
    && typeof value.createLandingRenderer === 'function'
    && 'warmupManifestPath' in value
    && typeof value.warmupManifestPath === 'string';
}

export async function loadLandingBuild({
  clientRoot,
  rendererPath,
}: LandingBuildPaths): Promise<LandingBuild> {
  const loadRenderer = createRequire(__filename);
  const renderer: unknown = loadRenderer(rendererPath);

  if (!isLandingRenderer(renderer)) {
    throw new TypeError('The landing renderer has invalid exports.');
  }

  const [indexHtml, manifestText] = await Promise.all([
    readFile(join(clientRoot, 'index.html'), 'utf8'),
    readFile(join(clientRoot, renderer.warmupManifestPath), 'utf8'),
  ]);
  const buildId = getBuildId(JSON.parse(manifestText));
  const renderLanding = renderer.createLandingRenderer(buildId);

  return {
    buildId,
    clientRoot,
    indexHtml,
    renderLanding,
  };
}
