/**
 * @jest-environment node
 */
import { createElement, type ReactElement } from 'react';

import {
  createDocumentationLoader,
  type DocumentationRemoteModule,
} from './load-documentation';

function EmptyDocumentation(): ReactElement {
  return createElement('main');
}

describe('documentation route loading', () => {
  it('preloads the requested article without the host basename', async () => {
    const initializeDocumentation = jest.fn(() => Promise.resolve());
    const remote: DocumentationRemoteModule = {
      default: EmptyDocumentation,
      initializeDocumentation,
    };
    const loader = createDocumentationLoader(async () => remote);

    const result = await loader({
      context: {},
      params: { '*': 'core-features' },
      pattern: '/docs/*',
      request: new Request('http://localhost/docs/core-features'),
      url: new URL('http://localhost/docs/core-features'),
    });

    expect(initializeDocumentation).toHaveBeenCalledWith('/core-features');
    expect(result).toBe(remote);
  });

  it('does not initialize documentation after the route was abandoned', async () => {
    const pending = Promise.withResolvers<DocumentationRemoteModule>();
    const controller = new AbortController();
    const initializeDocumentation = jest.fn(() => Promise.resolve());
    const loader = createDocumentationLoader(() => pending.promise);

    const loading = loader({
      context: {},
      params: {},
      pattern: '/docs/*',
      request: new Request('http://localhost/docs', { signal: controller.signal }),
      url: new URL('http://localhost/docs'),
    });

    controller.abort();
    pending.resolve({ default: EmptyDocumentation, initializeDocumentation });

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
    expect(initializeDocumentation).not.toHaveBeenCalled();
  });

  it('rejects a cancelled article initialization', async () => {
    const article = Promise.withResolvers<void>();
    const started = Promise.withResolvers<void>();
    const controller = new AbortController();
    const loader = createDocumentationLoader(async () => ({
      default: EmptyDocumentation,
      initializeDocumentation: () => {
        started.resolve();

        return article.promise;
      },
    }));

    const loading = loader({
      context: {},
      params: {},
      pattern: '/docs/*',
      request: new Request('http://localhost/docs', { signal: controller.signal }),
      url: new URL('http://localhost/docs'),
    });

    await started.promise;
    controller.abort();
    article.resolve();

    await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
  });
});
