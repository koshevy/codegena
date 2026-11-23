import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';

import { phraseGroupClasses, PhraseGroupStyles } from './phrase-group.styles';

interface PhraseGroupProps {
  color?: MotionValue<string>;
  opacity?: MotionValue<number>;
  phrases: readonly string[];
}

export function PhraseGroup({
  color,
  opacity,
  phrases,
}: PhraseGroupProps): ReactElement {
  const renderedPhrases = phrases.map((phrase) => (
    <span
      className={phraseGroupClasses.phrase}
      key={phrase}
    >
      {phrase}
    </span>
  ));

  return (
    <PhraseGroupStyles
      data-main={!!color}
      style={{ color, opacity }}
    >
      {renderedPhrases}
    </PhraseGroupStyles>
  );
}
