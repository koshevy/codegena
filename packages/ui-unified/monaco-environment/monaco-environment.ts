import type { Environment } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

export const monacoEnvironment: Environment = {
  getWorker(_workerId, label) {
    if (label === 'json') {
      return new JsonWorker();
    }

    return new EditorWorker();
  },
};
