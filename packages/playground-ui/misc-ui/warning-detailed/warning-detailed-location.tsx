import type { GraphPayloadSourceLocation } from '@codegena/graph-core';
import { ShowHideButton } from '@codegena/ui-unified/feedback';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { type ReactElement, useCallback, useState } from 'react';

import { useWarningDetailedAriaLabel } from './use-warning-detailed-aria-label';
import { WarningDetailedCodeLine } from './warning-detailed-code-line';
import {
  warningDetailedLocationClasses,
  WarningDetailedLocationStyles,
} from './warning-detailed-location.styles';
import type { WarningSourceLine } from '../warning-utils';

interface WarningDetailedLocationProps {
  lineNumberWidth: number;
  location: GraphPayloadSourceLocation;
  onNavigateToSource?: (location: GraphPayloadSourceLocation) => void;
  sourceLines: WarningSourceLine[];
}

export function WarningDetailedLocation({
  lineNumberWidth,
  location,
  onNavigateToSource,
  sourceLines,
}: WarningDetailedLocationProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const ariaLabel = useWarningDetailedAriaLabel(location);

  const handleToggle = useCallback((): void => {
    setExpanded((current) => !current);
  }, []);

  const handleNavigate = useCallback((): void => {
    onNavigateToSource?.(location);
  }, [
    location,
    onNavigateToSource,
  ]);

  return (
    <WarningDetailedLocationStyles>
      <ShowHideButton
        hideLabel="Hide source"
        isExpanded={expanded}
        onToggle={handleToggle}
        showLabel="Show source"
      />
      <Collapse in={expanded}>
        <Box
          aria-label={ariaLabel}
          className={warningDetailedLocationClasses.code}
          component="button"
          onClick={handleNavigate}
          type="button"
        >
          {sourceLines.map((line) => (
            <WarningDetailedCodeLine
              key={line.lineNumber}
              line={line}
              lineNumberWidth={lineNumberWidth}
            />
          ))}
        </Box>
      </Collapse>
    </WarningDetailedLocationStyles>
  );
}
