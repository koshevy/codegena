import type { GraphPayloadLog, GraphPayloadSourceLocation } from '@codegena/graph-core';
import { SeverityCard, SeverityLabel } from '@codegena/ui-unified/feedback';
import {
  type MouseEvent,
  type ReactElement,
  type Ref,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { WarningDetailedLocation } from './warning-detailed-location';
import { WarningCopyMenu } from '../warning-copy-menu';
import { getWarningDetails } from '../warning-utils';

export interface WarningDetailedProps {
  log: GraphPayloadLog;
  onNavigateToSource?: (location: GraphPayloadSourceLocation) => void;
  ref?: Ref<HTMLElement>;
  sourceSchemaText: string;
}

export function WarningDetailed({
  log,
  onNavigateToSource,
  ref,
  sourceSchemaText,
}: WarningDetailedProps): ReactElement {
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const location = log.jsoncNode;

  const {
    lineNumberWidth,
    message,
    sourceLines,
  } = useMemo(
    () => getWarningDetails(log, sourceSchemaText),
    [
      log,
      sourceSchemaText,
    ],
  );

  const handleContextMenu = useCallback((event: MouseEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ left: event.clientX, top: event.clientY });
  }, []);

  const handleClose = useCallback((): void => {
    setMenuPosition(null);
  }, []);

  const sourceLocationLabel = location
    ? `${location.fileName}:${location.line}:${location.col}`
    : 'Source location unavailable';

  const severity = log.level === 'error' ? 'error' : 'warning';

  const renderedHeading = (
    <SeverityLabel
      label={sourceLocationLabel}
      severity={severity}
    />
  );

  const renderedLocation = location && (
    <WarningDetailedLocation
      lineNumberWidth={lineNumberWidth}
      location={location}
      onNavigateToSource={onNavigateToSource}
      sourceLines={sourceLines}
    />
  );

  return (
    <SeverityCard
      ariaLabel={`Warning: ${sourceLocationLabel}`}
      heading={renderedHeading}
      message={message}
      onContextMenu={handleContextMenu}
      ref={ref}
      severity={severity}
    >
      {renderedLocation}
      <WarningCopyMenu
        position={menuPosition}
        logs={[log]}
        onClose={handleClose}
        scope="single"
        sourceSchemaText={sourceSchemaText}
      />
    </SeverityCard>
  );
}
