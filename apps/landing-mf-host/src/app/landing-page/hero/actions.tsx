import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Button from '@mui/material/Button';
import { HockeyStick } from 'lucide-react';
import type { MotionValue } from 'motion/react';
import type { ReactElement, RefObject } from 'react';

import { actionsClasses, ActionsStyles } from './actions.styles';
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
      <Button
        disabled={!areFeaturesReady}
        endIcon={renderedPlaygroundIcon}
        onClick={handlePlaygroundClick}
        size="large"
        variant="contained"
      >
        Playground
      </Button>
      <button
        className={actionsClasses.secondary}
        disabled={isFeatureActionDisabled}
        onClick={handleSecondaryClick}
        type="button"
      >
        {isPromptReady ? 'See more' : 'How it works'}
        {renderedSecondaryIcon}
      </button>
    </ActionsStyles>
  );
}
