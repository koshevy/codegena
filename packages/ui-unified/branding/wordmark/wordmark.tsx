import useMediaQuery from '@mui/material/useMediaQuery';
import type { ReactElement } from 'react';

import { WordmarkShapes } from './wordmark-shapes';
import { WordmarkStyles } from './wordmark.styles';

interface WordmarkProps {
  className?: string;
  isAnimated?: boolean;
}

export function Wordmark({
  className,
  isAnimated = true,
}: WordmarkProps): ReactElement {
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasToAnimate = isAnimated && !shouldReduceMotion;

  return (
    <WordmarkStyles
      className={className}
      titleAccess="Codegena wordmark"
      viewBox="0 0 1206 195"
    >
      <WordmarkShapes isAnimated={hasToAnimate} />
    </WordmarkStyles>
  );
}
