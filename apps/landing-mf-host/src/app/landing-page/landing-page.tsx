import {
  lazy,
  type ReactElement,
  Suspense,
  useCallback,
  useRef,
  useState,
} from 'react';

import { Hero } from './hero';
import { LandingPageStyles } from './landing-page.styles';
import type { LandingPreview } from './landing-preview';
import { Preloader } from './preloader';
import { useLandingEnhancement } from './use-landing-enhancement';
import { Menu } from '../menu';

function loadLandingFeatures(): Promise<typeof import('./landing-features')> {
  return import(
    /* webpackChunkName: "landing-features", webpackFetchPriority: "low" */
    './landing-features'
  );
}

const LandingFeatures = lazy(async () => {
  const { LandingFeatures: Features } = await loadLandingFeatures();

  return { default: Features };
});

const Footer = lazy(async () => {
  const { Footer: LandingFooter } = await loadLandingFeatures();

  return { default: LandingFooter };
});

const WindowScrollbar = lazy(async () => {
  const { WindowScrollbar: Scrollbar } = await import('./window-scrollbar');

  return { default: Scrollbar };
});

interface LandingPageProps {
  appBuildId: string;
  hasPainted: boolean;
  haveFeaturesLoaded?: boolean;
  onFeaturesReady?: () => void;
  preview?: LandingPreview;
}

/**
 * The landing experience shown by the Module Federation host.
 */
export function LandingPage({
  appBuildId,
  hasPainted,
  haveFeaturesLoaded = false,
  onFeaturesReady,
  preview,
}: LandingPageProps): ReactElement {
  const pageContentRef = useRef<HTMLDivElement>(null);
  const featureSectionsRef = useRef<HTMLElement>(null);
  const [areFeaturesReady, setAreFeaturesReady] = useState(false);
  const canRenderFeatures = haveFeaturesLoaded || hasPainted;
  const canEnhancePreview = !!preview && hasPainted && !haveFeaturesLoaded;
  const loadEnhancement = canEnhancePreview ? loadLandingFeatures : undefined;
  const enhancement = useLandingEnhancement(loadEnhancement);
  const hasPreparedFeatures = !preview || haveFeaturesLoaded || enhancement === 'ready';
  const canRenderInteractiveContent = canRenderFeatures && hasPreparedFeatures;
  const canShowPreloader = !preview || canEnhancePreview;
  const isLoadingContent = canShowPreloader && !haveFeaturesLoaded && !areFeaturesReady
    && enhancement !== 'unavailable';

  const handleFeaturesReady = useCallback((): void => {
    setAreFeaturesReady(true);
    onFeaturesReady?.();
  }, [onFeaturesReady]);

  const renderedPreloader = isLoadingContent && <Preloader />;

  const renderedInteractiveFeatures = (
    <LandingFeatures
      appBuildId={appBuildId}
      onReady={handleFeaturesReady}
      sectionRef={featureSectionsRef}
    />
  );

  const renderedFeatures = canRenderInteractiveContent
    ? renderedInteractiveFeatures
    : preview?.renderedSections;

  const renderedFooter = canRenderInteractiveContent
    ? <Footer />
    : preview?.renderedFooter;

  const renderedScrollbar = hasPainted && (
    <Suspense fallback={null}>
      <WindowScrollbar />
    </Suspense>
  );

  return (
    <LandingPageStyles>
      {renderedPreloader}
      <Menu pageContentRef={pageContentRef} />
      <div
        id="landing-page-content"
        ref={pageContentRef}
      >
        <main>
          <Hero
            areFeaturesReady={areFeaturesReady}
            canLoadDeferredContent={hasPainted}
            featureSectionsRef={featureSectionsRef}
          />
          <Suspense fallback={preview?.renderedSections}>{renderedFeatures}</Suspense>
        </main>
        <Suspense fallback={preview?.renderedFooter}>{renderedFooter}</Suspense>
      </div>
      {renderedScrollbar}
    </LandingPageStyles>
  );
}
