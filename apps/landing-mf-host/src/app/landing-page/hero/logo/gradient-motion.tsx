import type { ReactElement } from 'react';

export function GradientMotion(): ReactElement {
  return (
    <animateTransform
      attributeName="gradientTransform"
      dur="12s"
      from="0 260 260"
      repeatCount="indefinite"
      to="360 260 260"
      type="rotate"
    />
  );
}
