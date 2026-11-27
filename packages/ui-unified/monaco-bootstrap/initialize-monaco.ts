import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

/**
 * Configure the shared editors with the host's local Monaco instance.
 * Call once at the browser bootstrap, before mounting an editor.
 */
export function initializeMonaco(): void {
  loader.config({ monaco });
  monaco.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    enableSchemaRequest: false,
    schemaRequest: 'ignore',
    schemaValidation: 'ignore',
    trailingCommas: 'ignore',
    validate: true,
  });
}
