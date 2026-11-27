import type { ReactElement, RefObject } from 'react';
import { useLoaderData, useOutletContext } from 'react-router-dom';

import type { LandingPreview } from './landing-preview';
import { LandingRoute } from './landing-route';

export interface LandingPageOutletContext {
  cookieNoticeRef: RefObject<HTMLDivElement | null>;
  hasPainted: boolean;
  haveLandingFeaturesLoaded: boolean;
  onLandingFeaturesReady: () => void;
}

interface LandingPageRouteProps {
  preview?: LandingPreview;
}

export function LandingPageRoute({ preview }: LandingPageRouteProps): ReactElement {
  const appBuildId = useLoaderData<string>();
  const {
    cookieNoticeRef,
    hasPainted,
    haveLandingFeaturesLoaded,
    onLandingFeaturesReady,
  } = useOutletContext<LandingPageOutletContext>();

  return (
    <LandingRoute
      appBuildId={appBuildId}
      cookieNoticeRef={cookieNoticeRef}
      hasPainted={hasPainted}
      haveFeaturesLoaded={haveLandingFeaturesLoaded}
      onFeaturesReady={onLandingFeaturesReady}
      preview={preview}
    />
  );
}
