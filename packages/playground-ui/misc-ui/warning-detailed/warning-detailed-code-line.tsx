import Box from '@mui/material/Box';
import clsx from 'clsx';
import { type ReactElement, useMemo } from 'react';

import type { WarningSourceLine } from '../warning-utils';
import {
  warningDetailedCodeLineClasses,
  WarningDetailedCodeLineStyles,
} from './warning-detailed-code-line.styles';

export interface WarningDetailedCodeLineProps {
  line: WarningSourceLine;
  lineNumberWidth: number;
}

export function WarningDetailedCodeLine({
  line,
  lineNumberWidth,
}: WarningDetailedCodeLineProps): ReactElement {
  const marker = line.isActive ? '>' : ' ';
  const lineLabel = String(line.lineNumber).padStart(lineNumberWidth);

  const renderedCaret = useMemo(() => {
    if (!line.isActive) {
      return null;
    }

    return (
      <Box
        className={warningDetailedCodeLineClasses.caret}
        component="span"
      >
        {`\n  ${' '.repeat(lineNumberWidth)} | ${line.caretSpacing}^`}
      </Box>
    );
  }, [
    line.isActive,
    line.caretSpacing,
    lineNumberWidth,
  ]);

  return (
    <WarningDetailedCodeLineStyles
      className={clsx({
        [warningDetailedCodeLineClasses.root]: true,
        [warningDetailedCodeLineClasses.active]: line.isActive,
      })}
      component="span"
    >
      <Box
        className={warningDetailedCodeLineClasses.lineNumber}
        component="span"
      >
        {`${marker} ${lineLabel} | `}
      </Box>
      {line.content}
      {renderedCaret}
    </WarningDetailedCodeLineStyles>
  );
}
