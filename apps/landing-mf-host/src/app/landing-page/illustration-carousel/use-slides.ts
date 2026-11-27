import useEmblaCarousel, {
  type EmblaViewportRefType,
} from 'embla-carousel-react';
import type { MotionValue } from 'motion/react';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface SlidesOptions {
  scrollProgress?: MotionValue<number>;
  slideCount: number;
}

interface SlidesState {
  carouselRef: EmblaViewportRefType;
  handleGoTo: (event: MouseEvent<HTMLButtonElement>) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  selectedIndex: number;
}

/**
 * Keeps carousel navigation and its active slide in sync with Embla.
 */
export function useSlides(
  { scrollProgress, slideCount }: SlidesOptions,
): SlidesState {
  const [carouselRef, carouselApi] = useEmblaCarousel({
    axis: 'y',
    containScroll: 'trimSnaps',
    duration: 22.5,
    loop: true,
    // Code editors and folder trees own their vertical pointer gestures.
    watchDrag: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback((): void => {
    if (carouselApi) {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    }
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.on('select', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [
    carouselApi,
    handleSelect,
  ]);

  const handleScrollProgress = useCallback((value: number): void => {
    if (!carouselApi || slideCount === 0) {
      return;
    }

    const slideIndex = Math.min(slideCount - 1, Math.floor(value * slideCount));

    if (carouselApi.selectedScrollSnap() !== slideIndex) {
      carouselApi.scrollTo(slideIndex);
    }
  }, [
    carouselApi,
    slideCount,
  ]);

  useEffect(() => {
    if (!carouselApi || !scrollProgress) {
      return;
    }

    handleScrollProgress(scrollProgress.get());

    return scrollProgress.on('change', handleScrollProgress);
  }, [
    carouselApi,
    handleScrollProgress,
    scrollProgress,
  ]);

  const handlePrevious = useCallback((): void => {
    carouselApi?.scrollPrev();
  }, [carouselApi]);

  const handleNext = useCallback((): void => {
    carouselApi?.scrollNext();
  }, [carouselApi]);

  const handleGoTo = useCallback((
    event: MouseEvent<HTMLButtonElement>,
  ): void => {
    carouselApi?.scrollTo(Number(event.currentTarget.value));
  }, [carouselApi]);

  return {
    carouselRef,
    handleGoTo,
    handleNext,
    handlePrevious,
    selectedIndex,
  };
}
