import type { GraphSearchSource } from '@codegena/graph-search-core';
import { motion, type MotionProps, type MotionValue } from 'motion/react';
import {
  createElement,
  Fragment,
  lazy,
  type ReactElement,
  type ReactNode,
  type Ref,
  Suspense,
  useCallback,
  useState,
} from 'react';

import { cliTerminalExample, TerminalImitator } from './cli';
import { loadSearchPreview } from './data-engine';
import {
  featureIllustrationClasses,
  FeatureIllustrationStyles,
} from './feature-illustration.styles';
import { FolderingIllustration } from './foldering';
import {
  IdeIllustration,
} from './ide-plugins';
import { CodeCarousel } from './json-schema';
import { useOrbitAngle } from './orbit';
import { getBlobFullScaleSectionProgress } from './section-progress';
import {
  loadNebula,
  UnifiedUiIllustration,
  type UnifiedUiDollyTarget,
} from './unified-ui';

const SearchIllustration = lazy(async () => {
  const { SearchIllustration: Preview } = await loadSearchPreview();

  return { default: Preview };
});

const UnifiedUiNebula = lazy(async () => {
  try {
    const { UnifiedUiNebula: Nebula } = await loadNebula();

    return { default: Nebula };
  }
  catch {
    return { default: (): ReactElement => createElement(Fragment) };
  }
});

interface FeatureIllustrationProps {
  activeStep: number;
  dollyTarget: UnifiedUiDollyTarget | null;
  folderingProgress: MotionValue<number>;
  labelOpacity: MotionValue<number>;
  onDollyComplete: () => void;
  onDollyUpdate: NonNullable<MotionProps['onUpdate']>;
  onDemoSelect: (specUrl: string, button: HTMLElement) => void;
  sceneRef: Ref<HTMLDivElement>;
  searchSource: GraphSearchSource;
  sectionProgress: MotionValue<number>;
  terminalProgressPercent: number;
}

/**
 * Shows the illustration belonging to the active section of the story.
 */
export function FeatureIllustration({
  activeStep,
  dollyTarget,
  folderingProgress,
  labelOpacity,
  onDollyComplete,
  onDollyUpdate,
  onDemoSelect,
  sceneRef,
  searchSource,
  sectionProgress,
  terminalProgressPercent,
}: FeatureIllustrationProps): ReactElement {
  const orbitAngle = useOrbitAngle();
  const nebulaRevealProgress = getBlobFullScaleSectionProgress();
  // Focusing a control inside the moving, clipped scene can scroll the page.
  const [hasEntered, setHasEntered] = useState(false);

  const handleEntranceComplete = useCallback((): void => {
    setHasEntered(true);
  }, []);

  let illustrationKind: 'code' | 'terminal' | 'foldering' | 'search' | 'ide' | 'unified';
  let renderedContent: ReactNode;

  switch (activeStep) {
    case 0:
      illustrationKind = 'code';
      renderedContent = (
        <CodeCarousel scrollProgress={sectionProgress} />
      );
      break;
    case 1:
      illustrationKind = 'terminal';
      renderedContent = (
        <TerminalImitator
          command={cliTerminalExample.command}
          greeting={cliTerminalExample.greeting}
          outputs={cliTerminalExample.outputs}
          progressPercent={terminalProgressPercent}
          prompt={cliTerminalExample.prompt}
        />
      );
      break;
    case 2:
      illustrationKind = 'foldering';
      renderedContent = (
        <FolderingIllustration scrollProgress={folderingProgress} />
      );
      break;
    case 3:
      illustrationKind = 'search';
      renderedContent = (
        <Suspense fallback={null}>
          <SearchIllustration
            orbitAngle={orbitAngle}
            searchSource={searchSource}
          />
        </Suspense>
      );
      break;
    case 5:
      illustrationKind = 'unified';
      renderedContent = (
        <UnifiedUiIllustration
          isZooming={!!dollyTarget}
          labelOpacity={labelOpacity}
          onSelect={onDemoSelect}
        />
      );
      break;
    default:
      illustrationKind = 'ide';
      renderedContent = <IdeIllustration orbitAngle={orbitAngle} />;
  }

  const renderedNebula = (activeStep === 4 || activeStep === 5) && (
    <Suspense fallback={null}>
      <UnifiedUiNebula
        isVisible={activeStep === 5}
        isZooming={!!dollyTarget}
        progress={sectionProgress}
        revealProgress={nebulaRevealProgress}
      />
    </Suspense>
  );

  return (
    <FeatureIllustrationStyles
      aria-label="Feature illustration"
      data-illustration={illustrationKind}
      initial={{ scale: 0.9, x: 100 }}
      onAnimationComplete={handleEntranceComplete}
      role="group"
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ amount: 0.15, once: true }}
      whileInView={{ scale: 1, x: 0 }}
    >
      {renderedNebula}
      <motion.div
        animate={{
          scale: dollyTarget?.scale ?? 1,
          x: dollyTarget?.x ?? 0,
          y: dollyTarget?.y ?? 0,
        }}
        className={featureIllustrationClasses.scene}
        inert={!hasEntered}
        onAnimationComplete={onDollyComplete}
        onUpdate={onDollyUpdate}
        ref={sceneRef}
        style={{ transformOrigin: dollyTarget?.origin ?? 'center center' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderedContent}
      </motion.div>
    </FeatureIllustrationStyles>
  );
}
