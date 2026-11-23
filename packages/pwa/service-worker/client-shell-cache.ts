import { clientShellFilesSchema } from '@codegena/pwa/common';

const clientShellCachePath = '/_client-shell-assets';

export async function storeClientShellFiles(
  cache: Cache,
  origin: string,
  files: readonly string[],
): Promise<void> {
  const result = clientShellFilesSchema.safeParse(files);

  if (result.success) {
    await cache.put(new URL(clientShellCachePath, origin), Response.json(result.data));
  }
}

export async function hasCachedClientShell(
  cache: Cache,
  origin: string,
): Promise<boolean> {
  const entry = await cache.match(new URL(clientShellCachePath, origin));

  if (!entry) {
    return false;
  }

  const files = clientShellFilesSchema.safeParse(await entry.json());

  if (!files.success) {
    return false;
  }

  const responses = await Promise.all(files.data.map((file) => (
    cache.match(new URL(file, origin))
  )));

  return responses.every(Boolean);
}
