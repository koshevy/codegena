import type { LoaderFunctionArgs } from 'react-router-dom';

export type DocumentationRemoteModule = typeof import('documentation-mf-remote/App');
export type LoadDocumentationRemote = () => Promise<DocumentationRemoteModule>;

/**
 * Preload the requested article before mounting Docusaurus's browser router.
 */
export function createDocumentationLoader(
  loadDocumentation: LoadDocumentationRemote,
): (args: LoaderFunctionArgs) => Promise<DocumentationRemoteModule> {
  return async ({ params, request }) => {
    const remote = await loadDocumentation();

    request.signal.throwIfAborted();
    await remote.initializeDocumentation(`/${params['*'] ?? ''}`);
    request.signal.throwIfAborted();

    return remote;
  };
}
