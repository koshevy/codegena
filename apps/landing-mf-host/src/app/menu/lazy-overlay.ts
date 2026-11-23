import { lazy } from 'react';

export const LazyEmbeddedMenu = lazy(async () => {
  const { EmbeddedMenu } = await import(
    /* webpackChunkName: "playground-overlay" */ './embedded-menu'
  );

  return { default: EmbeddedMenu };
});

export const LazyOverlay = lazy(async () => {
  const { Overlay } = await import(
    /* webpackChunkName: "navigation-overlay" */ './overlay'
  );

  return { default: Overlay };
});
