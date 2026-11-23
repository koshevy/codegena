/**
 * @jest-environment node
 */
import { setImmediate } from 'node:timers/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Loadable from 'react-loadable';

import { Article } from './__mocks__/article';
import { ArticleLoading } from './__mocks__/article-loading';

describe('documentation loader lifecycle', () => {
  it('preloads an article after an abandoned server render', async () => {
    const pending = Promise.withResolvers<typeof Article>();
    const DeferredArticle = Loadable({
      loader: () => pending.promise,
      loading: ArticleLoading,
    });

    expect(renderToStaticMarkup(<DeferredArticle />)).toContain('Loading article');

    pending.resolve(Article);
    await DeferredArticle.preload();

    expect(renderToStaticMarkup(<DeferredArticle />)).toContain('Article loaded');
  });

  it('handles a rejected load even when its render never mounts', async () => {
    const pending = Promise.withResolvers<typeof Article>();
    const error = new Error('The article download failed.');
    const DeferredArticle = Loadable({
      loader: () => pending.promise,
      loading: ArticleLoading,
    });

    renderToStaticMarkup(<DeferredArticle />);
    pending.reject(error);
    await setImmediate();

    expect(renderToStaticMarkup(<DeferredArticle />)).toContain(error.message);
    await expect(DeferredArticle.preload()).rejects.toBe(error);
  });

  it('reports the rendered article modules for server output', async () => {
    const report = jest.fn();
    const DeferredArticle = Loadable({
      loader: () => Promise.resolve(Article),
      loading: ArticleLoading,
      modules: ['documentation-article'],
    });

    await DeferredArticle.preload();
    renderToStaticMarkup(createElement(
      Loadable.Capture,
      { report },
      <DeferredArticle />,
    ));

    expect(report).toHaveBeenCalledWith('documentation-article');
  });
});
