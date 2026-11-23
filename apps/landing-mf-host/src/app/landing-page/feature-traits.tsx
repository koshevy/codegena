import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { featureSteps, unifiedUiStepIndex } from './feature-steps';
import type { FeatureTraitsProps } from './feature-traits.props';
import {
  featureTraitsClasses,
  FeatureTraitsStyles,
} from './feature-traits.styles';
import { HostLink } from '../navigation';

/**
 * Changes the feature traits while its section stays pinned in view.
 */
export function FeatureTraits({
  activeStep,
  isBlobCoveringScreen,
  isStatic = false,
}: FeatureTraitsProps): ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const step = featureSteps[activeStep] ?? featureSteps[0];
  const hasBadge = !!step.badge;
  const isUnifiedUi = activeStep === unifiedUiStepIndex;

  const renderedBadge = hasBadge && (
    <Chip
      className={featureTraitsClasses.badge}
      color="warning"
      component="span"
      label={step.badge}
    />
  );

  const renderedDocumentationLink = useMemo(() => {
    if (!step.documentationHref) {
      return null;
    }

    return (
      <HostLink
        className={featureTraitsClasses.textLink}
        href={step.documentationHref}
      >
        Reveal in documentation
        <ArrowOutwardIcon
          aria-hidden
          fontSize="small"
        />
      </HostLink>
    );
  }, [step.documentationHref]);

  const renderedTraits = (
    <>
      <Typography
        className={featureTraitsClasses.kicker}
        component="p"
      >
        {step.kicker}
      </Typography>
      <Typography
        className={featureTraitsClasses.heading}
        component="h2"
      >
        {step.title}
        <br />
        {step.subject ? `${step.subject} ` : null}
        <span
          className={featureTraitsClasses.emphasis}
          data-has-badge={hasBadge}
        >
          {step.emphasis}
          {renderedBadge}
        </span>
      </Typography>
      <Typography
        className={featureTraitsClasses.description}
        component="p"
      >
        {step.description}
      </Typography>
    </>
  );

  const renderedAnimatedTraits = (
    <AnimatePresence
      initial={false}
      mode="wait"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        data-blob-covering={isBlobCoveringScreen}
        data-unified-ui={isUnifiedUi}
        exit={{ opacity: 0, y: -24 }}
        initial={{ opacity: 0, y: 24 }}
        key={step.kicker}
        transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
      >
        {renderedTraits}
      </motion.div>
    </AnimatePresence>
  );

  const renderedStaticTraits = <div data-unified-ui={isUnifiedUi}>{renderedTraits}</div>;
  const renderedContent = isStatic ? renderedStaticTraits : renderedAnimatedTraits;

  return (
    <FeatureTraitsStyles>
      {renderedContent}
      {renderedDocumentationLink}
    </FeatureTraitsStyles>
  );
}
