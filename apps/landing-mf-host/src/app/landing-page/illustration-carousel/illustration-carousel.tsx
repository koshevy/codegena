import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactElement } from 'react';

import {
  Bullets,
} from './bullets';
import {
  Controls,
} from './controls';
import {
  illustrationCarouselClasses,
  IllustrationCarouselStyles,
} from './illustration-carousel.styles';
import type {
  IllustrationCarouselProps,
} from './illustration-slide';
import {
  SlideWindow,
} from './slide-window';
import {
  useSlides,
} from './use-slides';
import { IllustrationCaption } from '../illustration-caption';

/**
 * Presents illustration slides with one set of controls and captions.
 */
export function IllustrationCarousel({
  ariaLabel,
  bulletNoun,
  slides,
  scrollProgress,
  variant = 'code',
}: IllustrationCarouselProps): ReactElement {
  const isNarrow = useMediaQuery('(max-width: 700px)');

  const {
    carouselRef,
    handleGoTo,
    handleNext,
    handlePrevious,
    selectedIndex,
  } = useSlides({
    scrollProgress,
    slideCount: slides.length,
  });

  const renderedControls = (
    <Controls
      bulletNoun={bulletNoun}
      count={slides.length}
      onNext={handleNext}
      onPrevious={handlePrevious}
      selectedIndex={selectedIndex}
    />
  );

  const descriptionIdPrefix = `landing-playground-${variant}-description`;
  const renderedCaption = (
    <div
      className={illustrationCarouselClasses.caption}
      key="caption"
    >
      <div className={illustrationCarouselClasses.bulletPlacement}>
        <Bullets
          bulletNoun={bulletNoun}
          onGoTo={handleGoTo}
          selectedIndex={selectedIndex}
          slides={slides}
        />
      </div>
      <div className={illustrationCarouselClasses.descriptions}>
        {slides.map(({ description, fileName }, index) => (
          <div
            aria-hidden={selectedIndex !== index}
            key={fileName}
          >
            <IllustrationCaption id={`${descriptionIdPrefix}-${index + 1}`}>
              {description}
            </IllustrationCaption>
          </div>
        ))}
      </div>
    </div>
  );

  const renderedWindow = (
    <SlideWindow
      bulletNoun={bulletNoun}
      carouselRef={carouselRef}
      isNarrow={isNarrow}
      key="window"
      renderedControls={renderedControls}
      selectedIndex={selectedIndex}
      slides={slides}
      variant={variant}
    />
  );

  const renderedContent = isNarrow
    ? [renderedCaption, renderedWindow]
    : [renderedWindow, renderedCaption];

  return (
    <IllustrationCarouselStyles
      aria-label={ariaLabel}
      data-variant={variant}
      role="region"
    >
      {renderedContent}
    </IllustrationCarouselStyles>
  );
}
