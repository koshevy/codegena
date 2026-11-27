import Skeleton from '@mui/material/Skeleton';
import type { ReactElement } from 'react';

import {
  PlaygroundSourceSchemaSkeletonStyles,
} from './playground-source-schema-skeleton.styles';

const lines = [
  { line: 1, width: '42%' },
  { line: 2, width: '78%' },
  { line: 3, width: '55%' },
  { line: 4, width: '86%' },
  { line: 5, width: '64%' },
  { line: 6, width: '73%' },
  { line: 7, width: '38%' },
  { line: 8, width: '81%' },
  { line: 9, width: '57%' },
  { line: 10, width: '69%' },
  { line: 11, width: '46%' },
  { line: 12, width: '75%' },
] as const;

export function PlaygroundSourceSchemaSkeleton(): ReactElement {
  return (
    <PlaygroundSourceSchemaSkeletonStyles
      aria-label="Source editor is loading"
      role="status"
    >
      {lines.map(({ line, width }) => (
        <div
          aria-hidden
          className="PlaygroundSourceSchemaSkeleton__line"
          key={line}
        >
          <span className="PlaygroundSourceSchemaSkeleton__lineNumber">
            {line}
          </span>
          <Skeleton
            animation="wave"
            variant="rounded"
            width={width}
          />
        </div>
      ))}
    </PlaygroundSourceSchemaSkeletonStyles>
  );
}
