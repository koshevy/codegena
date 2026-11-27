import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';
import { useId } from 'react';

import { OrbitStyles } from './orbit.styles';

// The SVG path has a radius of 300 units.
const orbitTextLength = Math.round(2 * Math.PI * 300);

interface OrbitProps {
  angle: MotionValue<number>;
  phrase: string;
  repetitions: number;
  tone?: 'secondary' | 'warning';
}

/**
 * Places repeated text on a rotating circular path.
 */
export function Orbit({
  angle,
  phrase,
  repetitions,
  tone = 'secondary',
}: OrbitProps): ReactElement {
  const pathId = useId();
  const orbitText = `${phrase}  ·  `.repeat(repetitions);

  return (
    <OrbitStyles
      aria-label={phrase}
      data-tone={tone}
      role="img"
      style={{ rotate: angle }}
      viewBox="0 0 640 640"
    >
      <defs>
        <path
          d="M 320,20 a 300,300 0 1,1 0,600 a 300,300 0 1,1 0,-600"
          id={pathId}
        />
      </defs>
      <text>
        <textPath
          href={`#${pathId}`}
          lengthAdjust="spacing"
          textLength={orbitTextLength}
        >
          {orbitText}
        </textPath>
      </text>
    </OrbitStyles>
  );
}
