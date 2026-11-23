import { domAnimation, LazyMotion } from 'motion/react';
import { div as MotionDiv } from 'motion/react-m';
import { type ReactElement, type RefObject, useRef } from 'react';

import { useHydrationSnapshot } from '../../hydration';
import { SectionProgress } from '../section-indicator';
import { Actions } from './actions';
import { Artwork } from './artwork';
import { heroEntranceDuration } from './entrance-duration';
import { HeroHeading } from './heading';
import {
  heroClasses,
  HeroStyles,
} from './hero.styles';
import { HeroIntro } from './intro';
import { ScrollHint } from './scroll-hint';
import { useHalo } from './use-halo';
import { useScrollAnimation } from './use-scroll-animation';

interface HeroProps {
  areFeaturesReady: boolean;
  canLoadDeferredContent: boolean;
  featureSectionsRef: RefObject<HTMLElement | null>;
}

/**
 * Welcome screen and animated brand artwork.
 */
export function Hero({
  areFeaturesReady,
  canLoadDeferredContent,
  featureSectionsRef,
}: HeroProps): ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const haloRef = useHalo(areFeaturesReady);
  const canAnimateEntrance = useHydrationSnapshot(() => true, () => false);

  const {
    haloScale,
    haloY,
    mascotOpacity,
    mascotScale,
    mascotY,
    patternScale,
    scrollY,
    shouldReduceMotion,
  } = useScrollAnimation();

  const haloMotionStyle = shouldReduceMotion
    ? undefined
    : { scale: haloScale, y: haloY };

  const mascotMotionStyle = shouldReduceMotion
    ? undefined
    : { opacity: mascotOpacity, scale: mascotScale, y: mascotY };

  const patternMotionStyle = shouldReduceMotion
    ? undefined
    : { scale: patternScale };

  const renderedHeading = (
    <HeroHeading
      contentRef={contentRef}
      stageRef={stageRef}
      scrollY={scrollY}
      shouldReduceMotion={shouldReduceMotion}
    />
  );

  const renderedIntro = (
    <HeroIntro
      canLoadPrompt={canLoadDeferredContent}
      scrollY={scrollY}
      shouldReduceMotion={shouldReduceMotion}
    />
  );

  const renderedActions = (
    <Actions
      areFeaturesReady={areFeaturesReady}
      featureSectionsRef={featureSectionsRef}
      scrollY={scrollY}
    />
  );

  const initialContent = canAnimateEntrance ? { opacity: 0, y: 24 } : false;

  const renderedContent = (
    <MotionDiv
      animate={{ opacity: 1, y: 0 }}
      initial={initialContent}
      transition={{ duration: heroEntranceDuration }}
    >
      {renderedHeading}
      {renderedIntro}
      {renderedActions}
    </MotionDiv>
  );

  const renderedBottomLine = (
    <div className={heroClasses.bottomLine}>
      <ScrollHint />
      <SectionProgress current={1} />
    </div>
  );

  const renderedPattern = canLoadDeferredContent && (
    <MotionDiv
      aria-hidden
      className={heroClasses.pattern}
      style={patternMotionStyle}
    />
  );

  const renderedStageContent = (
    <>
      <MotionDiv
        aria-hidden
        className={heroClasses.halo}
        ref={haloRef}
        style={haloMotionStyle}
      />
      {renderedPattern}
      <div
        className={heroClasses.content}
        ref={contentRef}
      >
        {renderedContent}
      </div>
      <Artwork
        animateEntrance={canAnimateEntrance}
        contentRef={contentRef}
        isAnimated={!shouldReduceMotion}
        motionStyle={mascotMotionStyle}
      />
      {renderedBottomLine}
    </>
  );

  return (
    <HeroStyles
      aria-label="Welcome"
      component="section"
      id="overview"
    >
      <div
        className={heroClasses.stage}
        ref={stageRef}
      >
        <LazyMotion features={domAnimation}>
          {renderedStageContent}
        </LazyMotion>
      </div>
    </HeroStyles>
  );
}
