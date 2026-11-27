import Box, { type BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import type { ReactElement } from 'react';

export interface NestedItemCount {
  count: number;
  plural: string;
  singular: string;
}

export interface NestedItemsCountProps extends Pick<BoxProps, 'className' | 'sx'> {
  items: readonly NestedItemCount[];
}

// language=postcss
export const NestedItemsCountStyles = styled(Box)(({ theme }) => `
  & {
    color: ${theme.palette.text.secondary};
    flex-shrink: 0;
    font-size: 11px;
    white-space: nowrap;
  }
`);

function formatCount(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function NestedItemsCount({
  className,
  items,
  sx,
}: NestedItemsCountProps): ReactElement {
  const description = items.map(({ count, plural, singular }) => (
    formatCount(count, singular, plural)
  )).join(' · ');

  return (
    <NestedItemsCountStyles
      aria-label={description}
      className={className}
      component="span"
      role="note"
      sx={sx}
    >
      ({description})
    </NestedItemsCountStyles>
  );
}
