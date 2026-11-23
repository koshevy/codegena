import type { GraphPayloadLog } from '@codegena/graph-core';
import type { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { useEffect } from 'react';

import { createCodegenaMarkers } from './create-codegena-markers';

type MonacoEditor = Parameters<OnMount>[0];

const markerOwner = 'codegena';

export function useCodegenaMarkers(
  editor: MonacoEditor | null,
  logLevels: readonly string[],
  logs?: GraphPayloadLog[],
  onRevealWarning?: (log: GraphPayloadLog) => void,
): void {
  useEffect(() => {
    const model = editor?.getModel();

    if (!model) {
      return;
    }

    const markers = createCodegenaMarkers(
      model,
      logs ?? [],
      logLevels,
      !!onRevealWarning,
    );

    const linkOpener = onRevealWarning && monaco.editor.registerLinkOpener({
      open: (resource): boolean => {
        if (
          resource.scheme !== 'codegena-warning'
          || resource.query !== model.uri.toString()
        ) {
          return false;
        }

        const index = Number(resource.path.slice(1));
        const log = logs?.[index];

        if (!log || !Number.isSafeInteger(index)) {
          return false;
        }

        onRevealWarning(log);
        return true;
      },
    });

    monaco.editor.setModelMarkers(model, markerOwner, markers);

    return () => {
      linkOpener?.dispose();

      if (!model.isDisposed()) {
        monaco.editor.setModelMarkers(model, markerOwner, []);
      }
    };
  }, [
    editor,
    logs,
    logLevels,
    onRevealWarning,
  ]);
}
