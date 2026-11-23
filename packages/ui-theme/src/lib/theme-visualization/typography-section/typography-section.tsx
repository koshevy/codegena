import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReactElement } from 'react';

import { typographySectionItems } from './typography-section.constants';
import {
  TypographyFamilyName,
  TypographyFamilyPanel,
  TypographyFamilyStack,
  TypographyVariantRow,
  TypographyVariantSample,
} from './typography-section.styles';
import { formatTypographySpec } from './typography-section.utils';
import { fontFamilies } from '../../theme/typography';
import { SectionCard } from '../section-card/section-card';

/**
 * @internal
 */
export function TypographySection(): ReactElement {
  const theme = useTheme();

  return (
    <SectionCard
      accentColor={theme.palette.primary.main}
      subtitle="Golos Text scale across headings, body, and Codegena-specific variants."
      title="Typographics"
    >
      <Stack spacing={2.5}>
        <TypographyFamilyPanel>
          <Typography
            color="text.secondary"
            variant="overline"
          >
            Primary font family
          </Typography>
          <TypographyFamilyName variant="h4">
            Golos Text
          </TypographyFamilyName>
          <TypographyFamilyStack
            color="text.secondary"
            variant="caption"
          >
            {fontFamilies.ui}
          </TypographyFamilyStack>
        </TypographyFamilyPanel>

        <Stack spacing={1.5}>
          {typographySectionItems.map(({ label, sample, variant }) => (
            <TypographyVariantRow key={variant}>
              <Typography
                color="text.secondary"
                variant="caption"
              >
                {label}
              </Typography>
              <TypographyVariantSample variant={variant}>
                {sample}
              </TypographyVariantSample>
              <Typography
                color="text.secondary"
                variant="caption"
              >
                {formatTypographySpec(theme.typography[variant])}
              </Typography>
            </TypographyVariantRow>
          ))}
        </Stack>
      </Stack>
    </SectionCard>
  );
}
