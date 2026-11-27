import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

import { spacingSectionSteps } from './spaces-section.constants';
import {
  MetricCardStyles,
  MetricCardValue,
  SpacingBarStyles,
  SpacingBarTrack,
  SpacingMetricsGrid,
  SpacingRowMeta,
  SpacingRowStyles,
} from './spaces-section.styles';
import { SectionCard } from '../section-card/section-card';

/**
 * @internal
 */
export function SpacesSection(): ReactElement {
  const theme = useTheme();
  const metrics = [
    { label: 'Base unit', value: theme.spacing(1) },
    { label: 'Border radius', value: `${theme.shape.borderRadius}px` },
    {
      label: 'HTML font size',
      value: `${theme.typography.htmlFontSize}px`,
    },
  ];

  return (
    <SectionCard
      accentColor={theme.palette.focus.main}
      subtitle={`Base spacing unit is ${theme.spacing(1)} with a ${
        theme.shape.borderRadius
      }px corner radius.`}
      title="Spaces"
    >
      <Stack spacing={2.5}>
        <SpacingMetricsGrid>
          {metrics.map(({ label, value }) => (
            <MetricCardStyles key={label}>
              <Typography
                color="text.secondary"
                variant="caption"
              >
                {label}
              </Typography>
              <MetricCardValue variant="subtitle1">{value}</MetricCardValue>
            </MetricCardStyles>
          ))}
        </SpacingMetricsGrid>

        <Stack spacing={1.5}>
          {spacingSectionSteps.map((step) => {
            const size = theme.spacing(step);

            return (
              <SpacingRowStyles key={step}>
                <Typography
                  color="text.secondary"
                  variant="caption"
                >
                  {step}
                </Typography>
                <SpacingBarTrack>
                  <SpacingBarStyles barWidth={size} />
                </SpacingBarTrack>
                <SpacingRowMeta
                  color="text.secondary"
                  variant="caption"
                >
                  theme.spacing({step}) = {size}
                </SpacingRowMeta>
              </SpacingRowStyles>
            );
          })}
        </Stack>
      </Stack>
    </SectionCard>
  );
}
