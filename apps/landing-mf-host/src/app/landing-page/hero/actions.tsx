import { GradientButton } from '@codegena/ui-unified/buttons';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { HockeyStick } from 'lucide-react';
import type { MotionValue } from 'motion/react';
import type { ReactElement, RefObject } from 'react';

import { ActionsStyles } from './actions.styles';
import { useNavigation } from './use-navigation';

interface ActionsProps {
  areFeaturesReady: boolean;
  featureSectionsRef: RefObject<HTMLElement | null>;
  scrollY: MotionValue<number>;
}

export function Actions({
  areFeaturesReady,
  featureSectionsRef,
  scrollY,
}: ActionsProps): ReactElement {
  const {
    handlePlaygroundClick,
    handleSecondaryClick,
    isPromptReady,
  } = useNavigation(scrollY, featureSectionsRef);

  const isFeatureActionDisabled = isPromptReady && !areFeaturesReady;

  const renderedSecondaryIcon = (
    <ArrowDownwardIcon
      aria-hidden
      fontSize="small"
    />
  );

  const renderedPlaygroundIcon = (
    <HockeyStick
      aria-hidden
      size={18}
    />
  );

  return (
    <ActionsStyles>
      <GradientButton
        aria-description="Jump to the interactive Playground examples."
        disabled={!areFeaturesReady}
        endIcon={renderedPlaygroundIcon}
        onClick={handlePlaygroundClick}
        size="large"
        variant="contained"
      >
        Playground
      </GradientButton>
      <GradientButton
        disabled={isFeatureActionDisabled}
        endIcon={renderedSecondaryIcon}
        onClick={handleSecondaryClick}
        size="large"
        variant="outlined"
      >
        {isPromptReady ? 'See more' : 'How it works'}
      </GradientButton>
    </ActionsStyles>
  );
}
