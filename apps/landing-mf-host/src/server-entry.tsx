import type { DevModeEnv } from '@codegena/util-dev-mode';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
  type StaticHandler,
} from 'react-router-dom';

import bundleWarmupConfig from '../bundle-warmup';
import {
  AppProviders,
  createApplicationRoute,
  createHomeRoute,
} from './app';
import { LandingPageRoute, renderPreviewBlock } from './app/landing-page';
import { FeatureOverview } from './app/landing-page/feature-overview';
import { Footer } from './app/landing-page/footer';
import { Infographics } from './app/landing-page/ideology';

const preview = {
  renderedSections: renderPreviewBlock('sections', (
    <>
      <FeatureOverview />
      <Infographics />
    </>
  )),
  renderedFooter: renderPreviewBlock('footer', <Footer />),
};

export const warmupManifestPath = bundleWarmupConfig.manifestPath;

async function renderRequest(
  handler: StaticHandler,
  request: Request,
): Promise<string> {
  const context = await handler.query(request);

  if (context instanceof Response || context.errors) {
    throw new Error('Unable to render the landing route.');
  }

  const requestUrl = new URL(request.url);
  const devModeEnv: DevModeEnv = {
    isDevMode: false,
    isTestingMode: requestUrl.searchParams.get('testingMode') === 'true',
  };
  const router = createStaticRouter(handler.dataRoutes, context);

  return renderToString(
    <StrictMode>
      <AppProviders devModeEnv={devModeEnv}>
        <StaticRouterProvider
          context={context}
          hydrate={false}
          router={router}
        />
      </AppProviders>
    </StrictMode>,
  );
}

export function createLandingRenderer(
  appBuildId: string,
): (request: Request) => Promise<string> {
  const renderedLanding = <LandingPageRoute preview={preview} />;
  const home = createHomeRoute(appBuildId, renderedLanding);
  const layout = createApplicationRoute(bundleWarmupConfig.warmupGroups, [home]);
  const handler = createStaticHandler([layout]);

  return (request) => renderRequest(handler, request);
}
