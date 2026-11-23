import type { Compilation } from '@rspack/core';
import { posix } from 'node:path';
import { z } from 'zod';

const syncAssetsSchema = z.object({ sync: z.array(z.string()) });
const remoteExposeSchema = z.object({
  assets: z.object({ css: syncAssetsSchema, js: syncAssetsSchema }),
  name: z.string(),
});
const remoteEntrySchema = z.object({ name: z.string(), path: z.string() });
const remoteManifestSchema = z.object({
  exposes: z.array(remoteExposeSchema),
  metaData: z.object({ remoteEntry: remoteEntrySchema }),
});

export function getWarmupRemoteFiles(
  compilation: Compilation,
  remotePath: string | undefined,
  expose: string,
): string[] {
  if (!remotePath) {
    throw new Error(`Set remotePath to warm the "${expose}" federation expose.`);
  }

  const asset = compilation.getAsset(remotePath);

  if (!asset) {
    throw new Error(`Missing federation manifest for bundle warming: ${remotePath}`);
  }

  const body: unknown = JSON.parse(asset.source.source().toString());
  const manifest = remoteManifestSchema.parse(body);
  const exposedModule = manifest.exposes.find(({ name }) => name === expose);

  if (!exposedModule) {
    throw new Error(`Missing "${expose}" expose in federation manifest ${remotePath}.`);
  }

  const entry = manifest.metaData.remoteEntry;
  const remoteDirectory = posix.dirname(remotePath);
  const files = [
    posix.join(entry.path, entry.name),
    ...exposedModule.assets.js.sync,
    ...exposedModule.assets.css.sync,
  ];

  return files.map((file) => {
    const remoteFile = posix.join(remoteDirectory, file);
    const relativePath = posix.relative(remoteDirectory, remoteFile);
    const isOutsideRemote = relativePath === '..' || relativePath.startsWith('../');

    if (isOutsideRemote || !compilation.getAsset(remoteFile)) {
      throw new Error(`Invalid federation asset for bundle warming: ${remoteFile}`);
    }

    return remoteFile;
  });
}
