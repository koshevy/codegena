import { span as MotionSpan } from 'motion/react-m';
import type { ReactElement } from 'react';

import { PhraseGroup } from './phrase-group';
import type { PhraseLineProps } from './phrase-line.props';
import {
  phraseLineClasses,
  PhraseLineStyles,
} from './phrase-line.styles';
import { usePhraseEnding } from './use-phrase-ending';

/**
 * Repeats one title line so horizontal travel has no visible end.
 */
export function PhraseLine({
  contentRef,
  headingRef,
  stageRef,
  after,
  before,
  closingColor,
  closingPhrase,
  closingStop,
  extraOpacity,
  initialOffset,
  main,
  mainColor,
  reverse = false,
  scrollY,
}: PhraseLineProps): ReactElement {
  const {
    closingRef,
    lineRef,
    sequenceRef,
    surroundingOpacity,
    trackRef,
    x,
    y,
  } = usePhraseEnding({
    contentRef,
    headingRef,
    stageRef,
    closingStop,
    reverse,
    scrollY,
  });

  const renderedMain = (
    <PhraseGroup
      color={mainColor}
      phrases={main}
    />
  );

  const renderedAfter = (
    <PhraseGroup
      opacity={extraOpacity}
      phrases={after}
    />
  );

  const renderedBefore = (
    <PhraseGroup
      opacity={extraOpacity}
      phrases={before}
    />
  );

  const renderedSequence = (
    <>
      {renderedMain}
      {renderedAfter}
      {renderedBefore}
    </>
  );

  const renderedClosing = (
    <MotionSpan
      className={phraseLineClasses.closing}
      ref={closingRef}
      style={{ color: closingColor, opacity: extraOpacity }}
    >
      {closingPhrase}
    </MotionSpan>
  );

  const renderedFirstSequence = (
    <MotionSpan
      className={phraseLineClasses.sequence}
      ref={sequenceRef}
      style={{ opacity: surroundingOpacity }}
    >
      {renderedSequence}
    </MotionSpan>
  );

  const renderedSecondSequence = (
    <MotionSpan
      className={phraseLineClasses.sequence}
      style={{ opacity: surroundingOpacity }}
    >
      {renderedSequence}
    </MotionSpan>
  );

  return (
    <PhraseLineStyles
      aria-hidden
      component="span"
      ref={lineRef}
    >
      <MotionSpan
        className={phraseLineClasses.track}
        ref={trackRef}
        style={{ left: initialOffset, x, y }}
      >
        <MotionSpan
          className={phraseLineClasses.tail}
          style={{ opacity: surroundingOpacity }}
        >
          {renderedBefore}
        </MotionSpan>
        {renderedFirstSequence}
        {renderedSecondSequence}
        {renderedClosing}
      </MotionSpan>
    </PhraseLineStyles>
  );
}
