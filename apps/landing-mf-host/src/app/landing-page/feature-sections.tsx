import type { GraphSearchSource } from '@codegena/graph-search-core';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion } from 'motion/react';
import {
  createElement,
  Fragment,
  lazy,
  type ReactElement,
  type RefObject,
  Suspense,
  useCallback,
  useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  FeatureIllustration,
} from './feature-illustration';
import {
  featureSectionsClasses,
  FeatureSectionsStyles,
} from './feature-sections.styles';
import { FeatureTraits } from './feature-traits';
import { SectionProgress } from './section-indicator';
import {
  loadGlitchLine,
  ProgressBlob,
  useFeatureScroll,
  useProgressBlobOffset,
} from './section-progress';
import {
  useUnifiedUiDolly,
} from './unified-ui';
import { getPlaygroundPath } from '../playground-examples';

const GlitchLine = lazy(async () => {
  try {
    const { GlitchLine: Line } = await loadGlitchLine();

    return { default: Line };
  }
  catch {
    return { default: (): ReactElement => createElement(Fragment) };
  }
});

interface FeatureSectionsProps {
  searchSource: GraphSearchSource;
  sectionRef: RefObject<HTMLElement | null>;
}

/**
 * Keeps the feature sections in view while their story advances on scroll.
 */
export function FeatureSections({
  searchSource,
  sectionRef,
}: FeatureSectionsProps): ReactElement {
  const isNarrow = useMediaQuery('(max-width: 700px)');
  const navigate = useNavigate();
  const { search } = useLocation();
  const stageRef = useRef<HTMLDivElement>(null);

  const {
    activeStep,
    blobProgress,
    blobScale,
    folderingProgress,
    isBlobCoveringScreen,
    isClosingSequence,
    sectionProgress,
    shouldReduceMotion,
    stageBottomRadius,
    stageScale,
    stageTopRadius,
    stageY,
    terminalProgressPercent,
  } = useFeatureScroll(isNarrow, sectionRef);

  const hasFlatStage = shouldReduceMotion;
  const blobOffset = useProgressBlobOffset(stageRef, blobProgress, isClosingSequence);

  const handleOpenExample = useCallback((specUrl: string): void => {
    void navigate(`${getPlaygroundPath(specUrl)}${search}`);
  }, [
    navigate,
    search,
  ]);

  const {
    handleAnimationComplete,
    handleSelect,
    handleZoomUpdate,
    labelOpacity,
    sceneRef,
    target,
  } = useUnifiedUiDolly(handleOpenExample);

  const renderedGlitchLine = activeStep === 5 && (
    <Suspense fallback={null}>
      <GlitchLine
        isNarrow={isNarrow}
        progress={sectionProgress}
        shouldReduceMotion={shouldReduceMotion}
      />
    </Suspense>
  );

  return (
    <FeatureSectionsStyles
      aria-label="Landing feature sections"
      component="section"
      id="playground"
      ref={sectionRef}
    >
      <motion.div
        className={featureSectionsClasses.stage}
        ref={stageRef}
        style={{
          borderBottomLeftRadius: hasFlatStage ? 0 : stageBottomRadius,
          borderBottomRightRadius: hasFlatStage ? 0 : stageBottomRadius,
          borderTopLeftRadius: hasFlatStage ? 0 : stageTopRadius,
          borderTopRightRadius: hasFlatStage ? 0 : stageTopRadius,
          scale: hasFlatStage ? 1 : stageScale,
          y: stageY,
        }}
      >
        <ProgressBlob
          isPaused={isBlobCoveringScreen}
          scale={blobScale}
          sectionProgress={sectionProgress}
          shouldReduceMotion={shouldReduceMotion}
          verticalOffset={blobOffset}
        />
        {renderedGlitchLine}
        <motion.div
          animate={{ opacity: target ? 0 : 1, x: target ? '-100vw' : 0 }}
          transition={{
            opacity: { duration: 0.22 },
            x: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          <FeatureTraits
            activeStep={activeStep}
            isBlobCoveringScreen={isBlobCoveringScreen}
          />
        </motion.div>
        <FeatureIllustration
          activeStep={activeStep}
          dollyTarget={target}
          folderingProgress={folderingProgress}
          labelOpacity={labelOpacity}
          onDemoSelect={handleSelect}
          onDollyComplete={handleAnimationComplete}
          onDollyUpdate={handleZoomUpdate}
          sceneRef={sceneRef}
          searchSource={searchSource}
          sectionProgress={sectionProgress}
          terminalProgressPercent={terminalProgressPercent}
        />
        <div
          aria-label="Feature section scroll progress"
          className={featureSectionsClasses.bottomLine}
          data-unified-ui={activeStep === 5}
          role="group"
        >
          <SectionProgress
            current={activeStep + 2}
            hasScrollCue
          />
        </div>
      </motion.div>
    </FeatureSectionsStyles>
  );
}
