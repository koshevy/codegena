import { type ReactElement, useRef } from 'react';

import type { HeroHeadingProps } from './hero-heading.props';
import {
  heroHeadingClasses,
  HeroHeadingStyles,
} from './hero-heading.styles';
import { HeroPhraseLines } from './hero-phrase-lines';
import { usePhase } from './use-phase';

const openingFirstLine = 'Code generation on steroids';
const openingSecondLine = 'you\'ve always dreamed of.';
const finalFirstLine = 'You don\'t need expensive models.';
const finalSecondLine = 'You need deterministic tools.';
const openingHeading = [openingFirstLine, openingSecondLine].join(' ');
const finalHeading = [finalFirstLine, finalSecondLine].join(' ');

/**
 * Owns the headline as it becomes two scroll-driven, repeating text lines.
 */
export function HeroHeading({
  contentRef,
  stageRef,
  scrollY,
  shouldReduceMotion,
}: HeroHeadingProps): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const phase = usePhase(scrollY);

  const hasFinal = phase === 'final';
  const isOpeningVisible = phase === 'opening' || shouldReduceMotion;

  const showsStaticFinal = hasFinal && shouldReduceMotion;
  const firstLine = showsStaticFinal
    ? finalFirstLine
    : openingFirstLine;

  const secondLine = showsStaticFinal
    ? finalSecondLine
    : openingSecondLine;

  const hasToRenderExpanded = phase !== 'opening'
    && !shouldReduceMotion;

  const headingLabel = hasFinal ? finalHeading : openingHeading;

  const renderedPhraseLines = hasToRenderExpanded && (
    <HeroPhraseLines
      contentRef={contentRef}
      firstClosingPhrase={finalFirstLine}
      hasSettled={hasFinal}
      headingRef={headingRef}
      scrollY={scrollY}
      secondClosingPhrase={finalSecondLine}
      stageRef={stageRef}
    />
  );

  return (
    <HeroHeadingStyles
      aria-label={headingLabel}
      className={heroHeadingClasses.root}
      component="h1"
      ref={headingRef}
    >
      <span
        className={heroHeadingClasses.original}
        style={{ visibility: isOpeningVisible ? 'visible' : 'hidden' }}
      >
        {firstLine}
        <br />
        {secondLine}
      </span>
      {renderedPhraseLines}
    </HeroHeadingStyles>
  );
}
