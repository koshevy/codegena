import type { OnMount } from '@monaco-editor/react';
import { type Node, parseTree } from 'jsonc-parser';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { useEffect } from 'react';

import { getJsonRefDefinition } from './get-json-ref-definition';

type MonacoEditor = Parameters<OnMount>[0];

export function useJsonRefDefinitions(editor: MonacoEditor | null): void {
  useEffect(() => {
    const editorModel = editor?.getModel();

    if (!editorModel) {
      return;
    }

    let parsedVersion = -1;
    let parsedTree: Node | undefined;

    const registration = monaco.languages.registerDefinitionProvider('json', {
      provideDefinition: (model, position) => {
        if (model !== editorModel) {
          return;
        }

        if (parsedVersion !== model.getVersionId()) {
          parsedTree = parseTree(model.getValue(), undefined, {
            allowTrailingComma: true,
          });
          parsedVersion = model.getVersionId();
        }

        return getJsonRefDefinition(model, position, parsedTree);
      },
    });

    return () => registration.dispose();
  }, [editor]);
}
