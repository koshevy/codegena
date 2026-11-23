export function loadMonacoEditors(): Promise<typeof import('./full')> {
  return import(/* webpackChunkName: "monaco-full-editor" */ './full');
}
