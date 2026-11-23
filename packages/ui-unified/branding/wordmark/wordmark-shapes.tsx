import type { ReactElement } from 'react';
import { useId, useMemo } from 'react';

import { wordmarkPath, wordmarkShadowPath } from './wordmark-paths';
import {
  wordmarkShapesClasses,
  WordmarkShapesStyles,
} from './wordmark-shapes.styles';

interface WordmarkShapesProps {
  isAnimated: boolean;
}

export function WordmarkShapes({ isAnimated }: WordmarkShapesProps): ReactElement {
  const gradientId = useId();
  const gradientFill = `url(#${gradientId})`;

  const renderedGradientMotion = useMemo(() => {
    if (!isAnimated) {
      return null;
    }

    return (
      <animateTransform
        attributeName="gradientTransform"
        dur="12s"
        from="0 0"
        repeatCount="indefinite"
        to="1206 0"
        type="translate"
      />
    );
  }, [isAnimated]);

  return (
    <WordmarkShapesStyles>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          spreadMethod="repeat"
          x1="0"
          x2="1206"
          y1="0"
          y2="0"
        >
          {renderedGradientMotion}
          <stop
            className={wordmarkShapesClasses.info}
            offset="0"
          />
          <stop
            className={wordmarkShapesClasses.primary}
            offset="0.333333"
          />
          <stop
            className={wordmarkShapesClasses.secondary}
            offset="0.666667"
          />
          <stop
            className={wordmarkShapesClasses.info}
            offset="1"
          />
        </linearGradient>
      </defs>
      <path
        d={wordmarkShadowPath}
        fill="none"
        stroke={gradientFill}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeOpacity="0.5"
        strokeWidth="2.75"
      />
      <path
        d={wordmarkPath}
        fill={gradientFill}
        fillRule="evenodd"
      />
    </WordmarkShapesStyles>
  );
}
