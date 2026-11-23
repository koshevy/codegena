import { defaultBundleWarmupManifestPath } from '@codegena/pwa/bundle-warmup-config';
import {
  bundleWarmupManifestSchema,
  bundleWarmupRequestSchema,
  type BundleWarmupManifest,
} from '@codegena/pwa/common';

async function readWarmupManifest(
  manifestPath = defaultBundleWarmupManifestPath,
): Promise<BundleWarmupManifest | undefined> {
  const response = await fetch(`/${manifestPath}`, {
    cache: 'no-cache',
    credentials: 'omit',
    mode: 'same-origin',
    priority: 'low',
    redirect: 'error',
  });

  if (!response.ok) {
    return undefined;
  }

  const body: unknown = await response.json();
  const manifest = bundleWarmupManifestSchema.safeParse(body);

  return manifest.data;
}

export async function warmBundleGroups(
  message: unknown,
  buildId: string,
  warmAssets: (
    files: readonly string[],
    clientShellFiles?: readonly string[],
  ) => Promise<void>,
): Promise<void> {
  const request = bundleWarmupRequestSchema.safeParse(message);

  if (!request.success || request.data.buildId !== buildId) {
    return;
  }

  let manifest: BundleWarmupManifest | undefined;

  try {
    manifest = await readWarmupManifest(request.data.manifestPath);
  }
  catch {
    // An unavailable manifest leaves the normal file requests in place.
    return;
  }

  if (!manifest || manifest.buildId !== buildId) {
    return;
  }

  const { clientShellGroup, groups } = manifest;
  const groupNames = request.data.groups.filter((group) => Object.hasOwn(groups, group));
  const files = [...new Set(groupNames.flatMap((group) => groups[group] ?? []))];
  const includesClientShell = !!clientShellGroup && groupNames.includes(clientShellGroup);
  const clientShellFiles = includesClientShell ? groups[clientShellGroup] : undefined;

  if (files.length > 0) {
    await warmAssets(files, clientShellFiles);
  }
}
