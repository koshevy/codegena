import type { Compilation } from '@rspack/core';

export function getWarmupAssetFiles(compilation: Compilation, prefix: string): string[] {
  const files = compilation.getAssets()
    .map(({ name }) => name)
    .filter((name) => name.startsWith(prefix) && /\.(?:js|css)$/.test(name));

  if (files.length === 0) {
    throw new Error(`Missing asset with prefix for bundle warming: ${prefix}`);
  }

  return files;
}

export function getWarmupChunkFiles(compilation: Compilation, name: string): string[] {
  const group = compilation.namedChunkGroups.get(name);

  if (!group) {
    throw new Error(`Missing chunk group for bundle warming: ${name}`);
  }

  return group.getFiles().filter((file) => /\.(?:js|css)$/.test(file));
}
