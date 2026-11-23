import type { ReactElement } from 'react';

import { FeatureOverviewIllustration } from './feature-overview-illustration';
import { FeatureOverviewStyles } from './feature-overview.styles';
import { featureSectionsClasses } from './feature-sections.styles';
import { featureSteps, unifiedUiStepIndex } from './feature-steps';
import {
  cliEnd,
  cliStart,
  closingSequenceStart,
  featureStoryHeight,
  folderingEnd,
  unifiedUiStart,
} from './feature-story';
import { FeatureTraits } from './feature-traits';
import { SectionProgress } from './section-indicator';

const chapterStarts = [
  0,
  cliStart,
  cliEnd,
  folderingEnd,
  closingSequenceStart,
  unifiedUiStart,
];

function getChapterHeight(index: number): string {
  const start = chapterStarts[index] ?? 0;
  const nextStart = chapterStarts[index + 1];
  const travel = (featureStoryHeight - 1) * ((nextStart ?? 1) - start);
  const height = nextStart === undefined ? travel + 1 : travel;

  return `${height * 100}svh`;
}

export function FeatureOverview(): ReactElement {
  const renderedSections = featureSteps.map(({ kicker }, index) => (
    <div
      key={kicker}
      style={{ height: getChapterHeight(index) }}
    >
      <div
        className={featureSectionsClasses.stage}
        data-unified-ui={index === unifiedUiStepIndex}
      >
        <FeatureTraits
          activeStep={index}
          isStatic
        />
        <FeatureOverviewIllustration activeStep={index} />
        <div className={featureSectionsClasses.bottomLine}>
          <SectionProgress
            current={index + 2}
            hasScrollCue
          />
        </div>
      </div>
    </div>
  ));

  return (
    <FeatureOverviewStyles
      aria-label="Landing feature sections"
      component="section"
      id="playground"
    >
      {renderedSections}
    </FeatureOverviewStyles>
  );
}
