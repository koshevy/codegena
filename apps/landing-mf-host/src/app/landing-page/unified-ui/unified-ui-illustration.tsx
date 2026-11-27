import { motion } from 'motion/react';
import type { ReactElement } from 'react';

import { DemoButton } from './demo-button';
import type {
  UnifiedUiIllustrationProps,
} from './unified-ui-illustration.props';
import {
  unifiedUiIllustrationClasses,
  UnifiedUiIllustrationStyles,
} from './unified-ui-illustration.styles';
import { demoChoices } from '../../playground-examples';

/**
 * Offers the browser playground examples in the Unified UI section.
 */
export function UnifiedUiIllustration({
  isZooming,
  labelOpacity,
  onSelect,
}: UnifiedUiIllustrationProps): ReactElement {
  const renderedChoices = demoChoices.map((choice) => (
    <DemoButton
      choice={choice}
      isZooming={isZooming}
      key={choice.label}
      labelOpacity={labelOpacity}
      onSelect={onSelect}
    />
  ));

  return (
    <UnifiedUiIllustrationStyles data-zooming={isZooming}>
      <div className={unifiedUiIllustrationClasses.list}>
        <motion.h3
          className={unifiedUiIllustrationClasses.heading}
          style={{ opacity: labelOpacity }}
        >
          Select example:
        </motion.h3>
        {renderedChoices}
      </div>
    </UnifiedUiIllustrationStyles>
  );
}
