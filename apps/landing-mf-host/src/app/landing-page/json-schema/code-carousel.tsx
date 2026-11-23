import {
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
} from '@codegena/ui-unified/icons';
import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';

import {
  codeExamples,
} from './code-carousel.examples';
import {
  IllustrationCarousel,
  type IllustrationSlide,
} from '../illustration-carousel';

function mapCodeExampleToSlide({
  description,
  fileName,
  source,
  tooltipTitle,
}: typeof codeExamples[number]): IllustrationSlide {
  return {
    description,
    fileName,
    icon: (
      <ProgrammingLanguageIcon
        language={resolveProgrammingLanguage('TypeScript')}
        showTooltip={false}
      />
    ),
    kind: 'code',
    source,
    tooltipTitle,
  };
}

const slides = codeExamples.map((example) => (
  mapCodeExampleToSlide(example)
));

interface CodeCarouselProps {
  scrollProgress: MotionValue<number>;
}

export function CodeCarousel({
  scrollProgress,
}: CodeCarouselProps): ReactElement {
  return (
    <IllustrationCarousel
      ariaLabel="Generated TypeScript examples"
      bulletNoun="code example"
      scrollProgress={scrollProgress}
      slides={slides}
    />
  );
}
