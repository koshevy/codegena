import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inc } from 'semver';

export async function getNextWorkspaceVersion(): Promise<string> {
  const manifestPath = join(
    __dirname,
    '../../../../packages/oas3-visitor-typescript/package.json',
  );
  const manifest: unknown = JSON.parse(await readFile(manifestPath, 'utf8'));

  if (!manifest || typeof manifest !== 'object'
    || !('version' in manifest) || typeof manifest.version !== 'string'
  ) {
    throw new Error(`Missing package version in ${manifestPath}.`);
  }

  const bumpedVersion = inc(manifest.version, 'prerelease', 'e2e');

  if (!bumpedVersion) {
    throw new Error(`Invalid package version: ${manifest.version}.`);
  }

  return bumpedVersion;
}
