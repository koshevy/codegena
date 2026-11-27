import type { GraphPayloadLog, GraphPayloadSourceLocation } from '@codegena/graph-core';
import { type ReactElement, type Ref, useMemo } from 'react';

import { WarningsListHeader } from './warnings-list-header';
import { WarningsListStyles } from './warnings-list.styles';
import { WarningDetailed } from '../warning-detailed';

export interface WarningsListProps {
  focusedWarning?: GraphPayloadLog;
  focusedWarningRef?: Ref<HTMLElement>;
  logs: GraphPayloadLog[];
  onNavigateToSource?: (location: GraphPayloadSourceLocation) => void;
  ref?: Ref<HTMLDivElement>;
  sourceSchemaText: string;
}

export function WarningsList({
  focusedWarning,
  focusedWarningRef,
  logs,
  onNavigateToSource,
  ref,
  sourceSchemaText,
}: WarningsListProps): ReactElement {
  const keyedLogs = useMemo(() => logs.map((log) => ({
    id: crypto.randomUUID(),
    log,
  })), [logs]);

  return (
    <WarningsListStyles ref={ref}>
      <WarningsListHeader
        logs={logs}
        sourceSchemaText={sourceSchemaText}
      />
      {keyedLogs.map(({ id, log }) => {
        const isFocusedWarning = log === focusedWarning;
        const warningRef = isFocusedWarning ? focusedWarningRef : undefined;

        return (
          <WarningDetailed
            key={id}
            log={log}
            onNavigateToSource={onNavigateToSource}
            ref={warningRef}
            sourceSchemaText={sourceSchemaText}
          />
        );
      })}
    </WarningsListStyles>
  );
}
