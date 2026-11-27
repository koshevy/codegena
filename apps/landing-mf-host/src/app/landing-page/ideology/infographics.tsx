import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { ReactElement } from 'react';

import { InfographicsItem } from './infographics-item';
import {
  infographicsClasses,
  InfographicsStyles,
} from './infographics.styles';
import { useBackground } from './use-background';

const capabilities = [
  {
    number: '01',
    title: 'Spec first',
    description: [
      'Use OpenAPI and business-level specifications as a source of truth',
      'that people and AI can interpret unambiguously.',
    ].join(' '),
  },
  {
    number: '02',
    title: 'Generate',
    description: [
      'Combine AI with established CI/CD automation for predictable,',
      'inexpensive results and consistent logic across codebases.',
    ].join(' '),
  },
  {
    number: '03',
    title: 'Extend',
    description: [
      'Adapt the output with simple EJS templates or AST-based generators.',
      'Tell us if you need Kotlin, Dart, or another language.',
    ].join(' '),
  },
  {
    number: '04',
    title: 'Explore',
    description: [
      'Inspect the result through search, graph views, and a virtual file system.',
      'IDE integration is planned.',
    ].join(' '),
  },
  {
    number: '05',
    title: 'Collaborate (soon)',
    description: [
      'We plan a shared UI for reviews, decisions, and precedent tracking,',
      'so AI, stakeholders, and decision makers can work within one',
      'auditable process.',
    ].join(' '),
  },
] as const;

/**
 * Five principles for managing complexity with Codegena.
 */
export function Infographics(): ReactElement {
  const {
    backgroundScale,
    sectionRef,
    shouldReduceMotion,
  } = useBackground();

  const backgroundMotionStyle = shouldReduceMotion
    ? undefined
    : { scale: backgroundScale };

  const renderedCapabilities = capabilities.map((capability) => (
    <InfographicsItem
      description={capability.description}
      key={capability.number}
      number={capability.number}
      title={capability.title}
    />
  ));

  return (
    <InfographicsStyles
      aria-labelledby="landing-ideology-heading"
      component="section"
      ref={sectionRef}
    >
      <motion.div
        aria-hidden
        className={infographicsClasses.halo}
        style={backgroundMotionStyle}
      />
      <motion.div
        aria-hidden
        className={infographicsClasses.pattern}
        data-testid="ideology-contours"
        style={backgroundMotionStyle}
      />
      <div
        className={infographicsClasses.headingRow}
        id="ideology"
      >
        <Typography
          className={infographicsClasses.kicker}
          component="p"
        >
          07 / THE IDEOLOGY
        </Typography>
        <div>
          <Typography
            className={infographicsClasses.heading}
            component="h2"
            id="landing-ideology-heading"
          >
            Complexity management
          </Typography>
          <Typography
            className={infographicsClasses.description}
            component="p"
          >
            In the age of AI, writing code is no longer the main challenge.
            The harder work is managing complexity and choosing the most efficient
            way to save human effort while understanding behavior, dependencies,
            and intent beyond implementation details.
          </Typography>
        </div>
      </div>
      <ol className={infographicsClasses.capabilities}>
        {renderedCapabilities}
      </ol>
    </InfographicsStyles>
  );
}
