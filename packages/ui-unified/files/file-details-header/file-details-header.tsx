import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';

import type { FileDetailsHeaderProps } from './file-details-header.props';
import {
  fileDetailsHeaderClasses,
  FileDetailsHeaderStyles,
} from './file-details-header.styles';

export function FileDetailsHeader({
  actions,
  ariaExpanded,
  ariaLabel,
  icon,
  isSelected = false,
  name,
  onSelect,
  tooltipTitle,
}: FileDetailsHeaderProps): ReactElement {
  const renderedLabel = (
    <>
      {icon}
      <Tooltip title={tooltipTitle ?? ''}>
        <Typography
          className={fileDetailsHeaderClasses.name}
          noWrap
          variant="subtitle2"
        >
          {name}
        </Typography>
      </Tooltip>
    </>
  );

  const renderedSelectableLabel = onSelect && (
    <ButtonBase
      aria-label={ariaLabel ?? `Select ${name}`}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaExpanded === undefined ? isSelected : undefined}
      className={fileDetailsHeaderClasses.select}
      onClick={onSelect}
    >
      {renderedLabel}
    </ButtonBase>
  );

  const renderedStaticLabel = !onSelect && (
    <Box className={fileDetailsHeaderClasses.select}>
      {renderedLabel}
    </Box>
  );

  const renderedActions = actions && (
    <Box className={fileDetailsHeaderClasses.actions}>
      {actions}
    </Box>
  );

  return (
    <FileDetailsHeaderStyles
      aria-label={`Details header for ${name}`}
      role="group"
    >
      {renderedSelectableLabel}
      {renderedStaticLabel}
      {renderedActions}
    </FileDetailsHeaderStyles>
  );
}
