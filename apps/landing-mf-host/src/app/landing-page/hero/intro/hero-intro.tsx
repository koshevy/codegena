import Typography from '@mui/material/Typography';
import type { MotionValue } from 'motion/react';
import { div as MotionDiv } from 'motion/react-m';
import { lazy, type ReactElement, Suspense } from 'react';

import {
  heroIntroClasses,
  HeroIntroStyles,
} from './hero-intro.styles';
import {
  ideaText,
  openingText,
} from './text';
import { useScrambledCopy } from './use-scrambled-copy';
import { useTransition } from './use-transition';

const Prompt = lazy(async () => {
  const { Prompt: PromptView } = await import('./prompt');

  return { default: PromptView };
});

interface HeroIntroProps {
  canLoadPrompt: boolean;
  scrollY: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}

/**
 * Reveals the installation command and AI prompt after the opening copy.
 */
export function HeroIntro({
  canLoadPrompt,
  scrollY,
  shouldReduceMotion,
}: HeroIntroProps): ReactElement {
  const {
    copyOpacity,
    copyScale,
    copyVisibility,
    installOpacity,
    installScale,
    installY,
    promptOpacity,
    promptScale,
    promptY,
    replacementVisibility,
    replacementY,
    rootY,
  } = useTransition(scrollY, shouldReduceMotion);

  const {
    accessibleText,
    segments,
  } = useScrambledCopy(
    scrollY,
    shouldReduceMotion,
  );

  const rootMotionStyle = shouldReduceMotion ? undefined : { y: rootY };

  const copyMotionStyle = shouldReduceMotion
    ? { visibility: copyVisibility }
    : {
        opacity: copyOpacity,
        scale: copyScale,
        visibility: copyVisibility,
      };

  const replacementMotionStyle = shouldReduceMotion
    ? { visibility: replacementVisibility }
    : { visibility: replacementVisibility, y: replacementY };

  const installMotionStyle = shouldReduceMotion
    ? undefined
    : { opacity: installOpacity, scale: installScale, y: installY };

  const promptMotionStyle = shouldReduceMotion
    ? undefined
    : { opacity: promptOpacity, scale: promptScale, y: promptY };

  const renderedCopySegments = segments.map(({ kind, startIndex, text }) => (
    <span
      className={heroIntroClasses[kind]}
      key={`${kind}-${startIndex}`}
    >
      {text}
    </span>
  ));

  const renderedCopy = (
    <MotionDiv
      className={heroIntroClasses.copy}
      style={copyMotionStyle}
    >
      <p>
        <span className={heroIntroClasses.accessible}>
          {accessibleText}
        </span>
        <span aria-hidden>{renderedCopySegments}</span>
      </p>
    </MotionDiv>
  );

  const renderedInstall = (
    <MotionDiv style={installMotionStyle}>
      <Typography
        className={heroIntroClasses.install}
        component="code"
      >
        npm i @codegena/oapi3ts@4
      </Typography>
    </MotionDiv>
  );

  const renderedPrompt = canLoadPrompt && (
    <MotionDiv
      className={heroIntroClasses.prompt}
      style={promptMotionStyle}
    >
      <Suspense fallback={null}>
        <Prompt />
      </Suspense>
    </MotionDiv>
  );

  const renderedReplacement = (
    <MotionDiv
      className={heroIntroClasses.replacement}
      style={replacementMotionStyle}
    >
      {renderedInstall}
      {renderedPrompt}
    </MotionDiv>
  );

  return (
    <MotionDiv style={rootMotionStyle}>
      <HeroIntroStyles className={heroIntroClasses.root}>
        <p
          aria-hidden
          className={heroIntroClasses.measure}
        >
          {openingText}
        </p>
        <p
          aria-hidden
          className={heroIntroClasses.measure}
        >
          {ideaText}
        </p>
        {renderedCopy}
        {renderedReplacement}
      </HeroIntroStyles>
    </MotionDiv>
  );
}
