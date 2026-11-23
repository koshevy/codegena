import { useNodeConnections } from '@xyflow/react';
import type { CSSProperties } from 'react';

interface ConnectedHandleVisibility {
  source?: CSSProperties;
  target?: CSSProperties;
}

export function useConnectedHandleVisibility(
  shouldHideUnconnectedHandles = true,
): ConnectedHandleVisibility {
  const sourceConnections = useNodeConnections({ handleType: 'source' });
  const targetConnections = useNodeConnections({ handleType: 'target' });

  if (!shouldHideUnconnectedHandles) {
    return {};
  }

  return {
    source: sourceConnections.length === 0 ? { visibility: 'hidden' } : undefined,
    target: targetConnections.length === 0 ? { visibility: 'hidden' } : undefined,
  };
}
