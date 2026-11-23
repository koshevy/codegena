import { useTheme } from '@mui/material/styles';
import { useTransform } from 'motion/react';
import type { ReactElement } from 'react';

import type { HeroPhraseLinesProps } from './hero-phrase-lines.props';
import { HeroPhraseLinesStyles } from './hero-phrase-lines.styles';
import { PhraseLine } from './phrase-line';

export function HeroPhraseLines({
  contentRef,
  firstClosingPhrase,
  hasSettled,
  headingRef,
  scrollY,
  secondClosingPhrase,
  stageRef,
}: HeroPhraseLinesProps): ReactElement {
  const theme = useTheme();
  const extraOpacity = useTransform(scrollY, [50, 180], [0, 1]);

  const firstLineColor = useTransform(
    scrollY,
    [50, 180],
    [theme.palette.text.primary, theme.palette.info.dark],
  );

  const secondLineColor = useTransform(
    scrollY,
    [50, 180],
    [theme.palette.info.dark, theme.palette.secondary.dark],
  );

  const secondClosingColor = hasSettled
    ? theme.palette.text.primary
    : theme.palette.info.dark;

  return (
    <HeroPhraseLinesStyles
      aria-hidden
      component="span"
    >
      <PhraseLine
        contentRef={contentRef}
        headingRef={headingRef}
        stageRef={stageRef}
        after={[
          'Plugin',
          'IDE',
          'TypeScript',
        ]}
        before={['MCP', 'OpenAPI', 'Design first']}
        closingColor={theme.palette.text.primary}
        closingPhrase={firstClosingPhrase}
        closingStop={820}
        extraOpacity={extraOpacity}
        initialOffset="calc(50vw - 26rem)"
        main={[
          'Code generation',
          'on steroids',
        ]}
        mainColor={firstLineColor}
        scrollY={scrollY}
      />
      <PhraseLine
        contentRef={contentRef}
        headingRef={headingRef}
        stageRef={stageRef}
        after={[
          'AI',
          'Collaboration',
          'UI Interface',
          'CLI',
          'System design',
          'Token economy',
        ]}
        before={['JSON Schema', 'Explore and search', 'Complexity control']}
        closingColor={secondClosingColor}
        closingPhrase={secondClosingPhrase}
        closingStop={870}
        extraOpacity={extraOpacity}
        initialOffset="calc(50vw - 24rem)"
        main={[
          'you\'ve always dreamed of.',
        ]}
        mainColor={secondLineColor}
        scrollY={scrollY}
        reverse
      />
    </HeroPhraseLinesStyles>
  );
}
