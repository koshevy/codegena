import type { ReactElement } from 'react';
import { useId, useMemo } from 'react';

import { GradientMotion } from './gradient-motion';
import { loopPath } from './logo-paths';
import { logoClasses, LogoStyles } from './logo.styles';
import { WordmarkShapes } from '../../branding';

interface LogoProps {
  isAnimated: boolean;
}

export function Logo({ isAnimated }: LogoProps): ReactElement {
  const gradientId = useId();
  const baseGradientId = `${gradientId}-base`;
  const topGradientId = `${gradientId}-top`;

  const renderedGradientMotion = useMemo(() => (
    isAnimated ? <GradientMotion /> : null
  ), [isAnimated]);

  return (
    <LogoStyles
      titleAccess="Codegena logo"
      viewBox="0 30 1206 900"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={baseGradientId}
          x1="75"
          x2="445"
          y1="395"
          y2="395"
        >
          {renderedGradientMotion}
          <stop
            className={logoClasses.info}
            offset="0"
          />
          <stop
            className={logoClasses.secondary}
            offset="1"
          />
        </linearGradient>
        <radialGradient
          cx="260"
          cy="80"
          gradientUnits="userSpaceOnUse"
          id={topGradientId}
          r="380"
        >
          {renderedGradientMotion}
          <stop
            className={logoClasses.primary}
            offset="0.1"
          />
          <stop
            className={logoClasses.primary}
            offset="1"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
      <g transform="translate(347.121 139.07) scale(0.98415)">
        <path
          d={loopPath}
          fill={`url(#${baseGradientId})`}
          fillRule="evenodd"
        />
        <path
          d={loopPath}
          fill={`url(#${topGradientId})`}
          fillRule="evenodd"
        />
      </g>
      <g transform="translate(0 730)">
        <WordmarkShapes isAnimated={isAnimated} />
      </g>
    </LogoStyles>
  );
}
