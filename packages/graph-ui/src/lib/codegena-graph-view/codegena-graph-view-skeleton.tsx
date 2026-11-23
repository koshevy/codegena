import Skeleton from '@mui/material/Skeleton';
import type { ReactElement } from 'react';

import {
  CodegenaGraphViewSkeletonStyles,
} from './codegena-graph-view-skeleton.styles';

export function CodegenaGraphViewSkeleton(): ReactElement {
  return (
    <CodegenaGraphViewSkeletonStyles
      aria-label="Graph layout is loading"
      role="status"
    >
      <Skeleton
        animation="wave"
        height={64}
        variant="rounded"
        width={112}
      />
      <Skeleton
        animation="wave"
        height={80}
        variant="rounded"
        width={180}
      />
      <Skeleton
        animation="wave"
        height={80}
        variant="rounded"
        width={180}
      />
    </CodegenaGraphViewSkeletonStyles>
  );
}
