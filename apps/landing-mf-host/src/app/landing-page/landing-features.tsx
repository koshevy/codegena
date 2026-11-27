import { type ReactElement, type RefObject, useLayoutEffect } from 'react';

import { useGithubSearchSource } from './demo-search';
import { FeatureSections } from './feature-sections';
import { Infographics } from './ideology';

export { Footer } from './footer';

interface LandingFeaturesProps {
  appBuildId: string;
  onReady: () => void;
  sectionRef: RefObject<HTMLElement | null>;
}

export function LandingFeatures({
  appBuildId,
  onReady,
  sectionRef,
}: LandingFeaturesProps): ReactElement {
  const searchSource = useGithubSearchSource(appBuildId);

  useLayoutEffect(onReady, [onReady]);

  return (
    <>
      <FeatureSections
        searchSource={searchSource}
        sectionRef={sectionRef}
      />
      <Infographics />
    </>
  );
}
