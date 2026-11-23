import preload from '@docusaurus/core/lib/client/preload';

/**
 * Prepare Docusaurus navigation and its initial page before mounting the remote.
 * The host supplies the article path without the browser router's basename.
 */
export async function initializeDocumentation(path = '/'): Promise<void> {
  await preload(path);
}
