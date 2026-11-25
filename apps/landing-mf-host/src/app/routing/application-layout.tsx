import { useBundleWarmup } from '@codegena/pwa/bundle-warmup';
import type { BundleWarmupGroups } from '@codegena/pwa/bundle-warmup-config';
import { setPreloadingStateOff } from '@codegena/ui-theme';
import { UnderConstruction } from '@codegena/ui-unified/under-construction';
import { WeUseCookies } from '@codegena/ui-unified/we-use-cookies';
import {
  lazy,
  type ReactElement,
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  type Location,
  matchPath,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from 'react-router-dom';

import { CookieNoticeSlot } from './application-layout.styles';
import {
  hasSavedScrollPositions,
  scrollRestorationStorageKey,
} from './landing-scroll-position';
import { NavigationCancelStyles, NavigationPending } from './navigation-pending.styles';
import { RouteLoading } from './route-loading';
import { useCancelNavigation } from './use-cancel-navigation';
import type { LandingPageOutletContext } from '../landing-page';
import { privacyPolicyHref, repositoryHref } from '../menu';
import { getPlaygroundLabel } from '../playground-examples';

export interface ApplicationLayoutProps extends BundleWarmupGroups<
  'landing' | 'playground' | 'other',
  'landingCompletelyLoaded'
> {
  underConstructionDisclamerText?: string;
}

const PlaygroundConvertingPlaceholder = lazy(async () => {
  const { PlaygroundConvertingPlaceholder: Placeholder } = await import(
    './playground-route-placeholder'
  );

  return { default: Placeholder };
});

function getScrollKey(location: Location): string {
  return location.pathname;
}

function getNavigationWarmupGroups(
  pathname: string,
  groups: ApplicationLayoutProps['warmAfterPaintedGroups'],
): readonly string[] {
  if (pathname === '/') {
    return groups.landing;
  }

  if (pathname.startsWith('/playground/')) {
    return groups.playground;
  }

  return groups.other;
}

export function ApplicationLayout({
  warmAfterPaintedGroups,
  extrasGroups,
  underConstructionDisclamerText,
}: ApplicationLayoutProps): ReactElement {
  const cookieNoticeRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigation = useNavigation();
  const handleCancel = useCancelNavigation();
  const [haveLandingFeaturesLoaded, setHaveLandingFeaturesLoaded] = useState(false);

  const isLanding = location.pathname === '/';
  const isNavigationIdle = navigation.state === 'idle';

  const canWarmLandingExtras = isLanding
    && haveLandingFeaturesLoaded
    && isNavigationIdle;
  const currentExtrasTurn = canWarmLandingExtras ? 'landingCompletelyLoaded' : undefined;

  const navigationWarmupGroups = getNavigationWarmupGroups(
    location.pathname,
    warmAfterPaintedGroups,
  );

  const { hasPainted } = useBundleWarmup({
    warmAfterPaintedGroups: navigationWarmupGroups,
    extrasGroups,
    currentExtrasTurn,
  });

  // The first scroll needs the target and full document height to exist.
  const waitsForLandingFeatures = isLanding
    && !haveLandingFeaturesLoaded
    && (location.hash !== '' || hasSavedScrollPositions());

  const handleLandingFeaturesReady = useCallback((): void => {
    setHaveLandingFeaturesLoaded(true);
  }, []);

  const outletContext: LandingPageOutletContext = {
    cookieNoticeRef,
    hasPainted,
    haveLandingFeaturesLoaded,
    onLandingFeaturesReady: handleLandingFeaturesReady,
  };

  const isLoading = navigation.state === 'loading';
  const pathname = navigation.location?.pathname ?? '';
  const isPlayground = pathname.startsWith('/playground');
  const match = matchPath('/playground/:specUrl', pathname);
  const label = isPlayground ? getPlaygroundLabel(match?.params['specUrl']) : undefined;

  useLayoutEffect(setPreloadingStateOff, []);

  const renderedCancel = isPlayground && (
    <NavigationCancelStyles onClick={handleCancel}>
      Cancel conversion
    </NavigationCancelStyles>
  );
  const renderedPendingPage = isPlayground
    ? <PlaygroundConvertingPlaceholder />
    : <RouteLoading label="Loading documentation" />;

  const renderedLoading = isLoading && (
    <NavigationPending
      aria-label={label}
      role={isPlayground ? 'dialog' : undefined}
    >
      <Suspense fallback={null}>{renderedPendingPage}</Suspense>
      {renderedCancel}
    </NavigationPending>
  );

  const renderedScrollRestoration = !waitsForLandingFeatures && (
    <ScrollRestoration
      getKey={getScrollKey}
      storageKey={scrollRestorationStorageKey}
    />
  );

  const renderedCookieNotice = (
    <WeUseCookies
      privacyPolicyHref={privacyPolicyHref}
      repoLink={repositoryHref}
    />
  );
  const renderedConstructionNotice = underConstructionDisclamerText && (
    <UnderConstruction disclamerText={underConstructionDisclamerText}>
      {renderedCookieNotice}
    </UnderConstruction>
  );

  return (
    <>
      <CookieNoticeSlot
        data-lenis-prevent
        ref={cookieNoticeRef}
      >
        {renderedConstructionNotice || renderedCookieNotice}
      </CookieNoticeSlot>
      <Outlet context={outletContext} />
      {renderedLoading}
      {renderedScrollRestoration}
    </>
  );
}
