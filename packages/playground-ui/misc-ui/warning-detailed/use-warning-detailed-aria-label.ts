import type { GraphPayloadSourceLocation } from '@codegena/graph-core';
import { useMemo } from 'react';

export function useWarningDetailedAriaLabel(
  location: GraphPayloadSourceLocation | undefined,
): string | undefined {
  const fileName = location?.fileName;
  const line = location?.line;
  const col = location?.col;

  return useMemo(() => {
    if (fileName === undefined || line === undefined || col === undefined) {
      return;
    }

    return ['Reveal', `${fileName}:${line}:${col}`, 'in JSON editor'].join(' ');
  }, [
    fileName,
    line,
    col,
  ]);
}
