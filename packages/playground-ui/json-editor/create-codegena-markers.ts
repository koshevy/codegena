import type { GraphPayloadLog } from '@codegena/graph-core';
import { findNodeAtOffset, type Node, parseTree } from 'jsonc-parser';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

import { getWarningMessage } from '../misc-ui/warning-utils';

export function createCodegenaMarkers(
  model: monaco.editor.ITextModel,
  logs: GraphPayloadLog[],
  logLevels: readonly string[],
  canRevealWarning: boolean,
): monaco.editor.IMarkerData[] {
  const tree = logs.length
    ? parseTree(model.getValue(), undefined, { allowTrailingComma: true })
    : undefined;

  const markerContext = {
    canRevealWarning,
    logLevels,
    model,
    tree,
  };

  return logs
    .map((log, index) => mapLogToCodegenaMarker(
      log,
      index,
      markerContext,
    ))
    .filter((marker): marker is monaco.editor.IMarkerData => marker !== null);
}

function mapLogToCodegenaMarker(
  log: GraphPayloadLog,
  index: number,
  {
    canRevealWarning,
    logLevels,
    model,
    tree,
  }: {
    canRevealWarning: boolean;
    logLevels: readonly string[];
    model: monaco.editor.ITextModel;
    tree: Node | undefined;
  },
): monaco.editor.IMarkerData | null {
  const location = log.jsoncNode;

  if (
    !location
    || !logLevels.includes(log.level)
    || !Number.isSafeInteger(location.line)
    || location.line < 1
    || location.line > model.getLineCount()
    || !Number.isSafeInteger(location.col)
    || location.col < 1
  ) {
    return null;
  }

  const position = model.validatePosition({
    column: location.col,
    lineNumber: location.line,
  });

  const sourceOffset = model.getOffsetAt(position);
  const sourceNode = tree && findNodeAtOffset(tree, sourceOffset);
  const word = model.getWordAtPosition(position);

  const fallbackEndColumn = word?.startColumn === position.column
    ? word.endColumn
    : position.column + 1;

  const fallbackEndPosition = model.validatePosition({
    column: fallbackEndColumn,
    lineNumber: position.lineNumber,
  });

  const endPosition = sourceNode?.offset === sourceOffset
    ? model.getPositionAt(sourceNode.offset + sourceNode.length)
    : fallbackEndPosition;

  const severity = log.level === 'error'
    ? monaco.MarkerSeverity.Error
    : monaco.MarkerSeverity.Warning;

  const code = canRevealWarning
    ? {
        target: monaco.Uri.from({
          path: `/${index}`,
          query: model.uri.toString(),
          scheme: 'codegena-warning',
        }),
        value: 'View in file details',
      }
    : undefined;

  const message = getWarningMessage(log);

  return {
    code,
    endColumn: endPosition.column,
    endLineNumber: endPosition.lineNumber,
    message: code ? `${message}\n` : message,
    severity,
    source: 'Codegena',
    startColumn: 1,
    startLineNumber: position.lineNumber,
  };
}
