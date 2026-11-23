import { FileDetailsHeader } from '@codegena/ui-unified/files';
import { motion } from 'motion/react';
import { type ReactElement, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { CodeSlide } from './code-slide';
import type { IllustrationSlide } from './illustration-slide';
import type {
  SlideWindowProps,
} from './slide-window.props';
import {
  PeelDrawer,
  usePeelDrawer,
} from '../peel-drawer';
import {
  slideWindowClasses,
  SlideWindowStyles,
  SlidePreviewStyles,
} from './slide-window.styles';

/**
 * Keeps one illustration mounted while its mobile drawer opens and closes.
 */
export function SlideWindow({
  bulletNoun,
  carouselRef,
  isNarrow,
  renderedControls,
  selectedIndex,
  slides,
  variant,
}: SlideWindowProps): ReactElement {
  const {
    handleClose,
    handleDrawerContentRef,
    handleOpen,
    handleTouchEnd,
    handleTouchStart,
    isOpen,
    portalHost,
    previewRef,
  } = usePeelDrawer();

  const editorHeight = variant === 'code'
    ? 'var(--landing-code-editor-height, min(54vh, 34rem))'
    : '100%';
  const selectedSlide = slides[selectedIndex] ?? slides[0];
  const canExpandCode = isNarrow && !isOpen && selectedSlide.kind === 'code';
  const handleHeaderSelect = isOpen ? handleClose : handleOpen;

  const toggleLabel = isNarrow
    ? `${isOpen ? 'Collapse' : 'Expand'} ${bulletNoun} ${selectedSlide.fileName}`
    : undefined;

  const renderSlide = useCallback((
    slide: IllustrationSlide,
    index: number,
  ): ReactElement => {
    const isSelected = selectedIndex === index;
    const renderedCode = slide.kind === 'code' && (
      <CodeSlide
        height={editorHeight}
        slide={slide}
      />
    );
    const renderedContent = slide.kind === 'code' ? renderedCode : slide.renderedContent;

    return (
      <div
        aria-describedby={`landing-playground-${variant}-description-${index + 1}`}
        aria-hidden={!isSelected}
        aria-label={`Example ${index + 1}/${slides.length}: ${slide.fileName}`}
        className={slideWindowClasses.slide}
        inert={!isSelected}
        key={slide.fileName}
        role="group"
      >
        {renderedContent}
      </div>
    );
  }, [
    editorHeight,
    selectedIndex,
    slides.length,
    variant,
  ]);

  const renderedSlides = slides.map((slide, index) => renderSlide(slide, index));

  const renderedHeader = (
    <div className={slideWindowClasses.header}>
      <FileDetailsHeader
        actions={renderedControls}
        ariaExpanded={isNarrow ? isOpen : undefined}
        ariaLabel={toggleLabel}
        icon={selectedSlide.icon}
        name={selectedSlide.fileName}
        onSelect={isNarrow ? handleHeaderSelect : undefined}
      />
    </div>
  );

  const renderedWindow = (
    <motion.div
      className={slideWindowClasses.window}
      data-kind={selectedSlide.kind}
      layout
      layoutId={isNarrow ? `landing-playground-${bulletNoun}` : undefined}
      onTouchEnd={canExpandCode ? handleTouchEnd : undefined}
      onTouchStart={canExpandCode ? handleTouchStart : undefined}
    >
      {renderedHeader}
      <div
        className={slideWindowClasses.viewport}
        onFocusCapture={canExpandCode ? handleOpen : undefined}
        ref={carouselRef}
      >
        <div className={slideWindowClasses.track}>
          {renderedSlides}
        </div>
      </div>
    </motion.div>
  );

  const renderedDrawer = isNarrow && (
    <PeelDrawer
      ariaLabel={`${bulletNoun}: ${selectedSlide.fileName}`}
      contentRef={handleDrawerContentRef}
      onClose={handleClose}
      open={isOpen}
    />
  );

  const renderedPortal = createPortal(
    <SlideWindowStyles
      data-drawer={isOpen ? 'true' : undefined}
      data-variant={variant}
    >
      {renderedWindow}
    </SlideWindowStyles>,
    portalHost,
  );

  return (
    <>
      <SlidePreviewStyles
        data-variant={variant}
        ref={previewRef}
      />
      {renderedDrawer}
      {renderedPortal}
    </>
  );
}
