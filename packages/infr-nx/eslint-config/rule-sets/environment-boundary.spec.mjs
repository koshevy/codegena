import { Linter } from 'eslint';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import typescriptEslint from 'typescript-eslint';

import { environmentBoundary } from './environment-boundary.mjs';

const cases = [
  ['src/app/view.js', 'const path = "./environment"; import(path);', 0],
  ['src/app/view.js', 'const { "env": values } = process;', 1],
  ['src/app/view.js', 'const { ["APP_CONFIG"]: config } = window;', 1],
  ['src/app/view.js', 'const { location, ...rest } = window;', 0],
  ['src/app/view.js', 'window.APP_CONFIG = {};', 0],
  ['src/app/view.js', 'window.APP_CONFIG ||= {};', 1],

  ['src/app/view.js', 'import { default as p } from "node:process"; p.env;', 1],
  ['src/app/view.js', 'const env = "version"; const { [env]: version } = process;', 0],
  ['src/app/view.js', 'const { ["env"]: values } = process;', 1],

  ['src/app/view.js', 'window.APP_CONFIG.apiUrl;', 1],
  ['src/app/view.js', 'globalThis.FEATURE_FLAG;', 1],
  ['src/app/view.js', 'globalThis.process.env.NODE_ENV;', 1],
  ['src/app/view.js', 'const { env } = import.meta;', 1],
  ['src/app/view.js', 'const { APP_CONFIG } = window;', 1],
  ['src/app/view.js', 'import { env } from "node:process"; env.NODE_ENV;', 1],
  ['src/app/view.js', 'import p from "node:process"; p.env.NODE_ENV;', 1],
  ['src/app/view.js', 'const process = { env: "local" }; process.env;', 0],
  ['src/app/view.js', 'const window = { APP_CONFIG: 1 }; window.APP_CONFIG;', 0],
  ['src/app/view.js', 'window.document.title; globalThis.Math.random();', 0],

  ['src/app/view.js', 'CUSTOM_CONFIG', 1],
  ['src/app/view.js', 'const local = 1; console.log(local);', 0],
  ['src/app/view.js', 'window.location.href; Math.random(); JSON.stringify({});', 0],
  ['src/app/view.js', 'declare const API_URL: string; fetch(API_URL);', 1],
  ['src/environment.js', 'export const url = CUSTOM_CONFIG;', 0],
  ['src/app/view.js', 'import(\'playground-mf-remote/App\');', 0],
  ['src/app/view.js', 'process.env.NODE_ENV', 1],
  ['src/bootstrap.js', 'process[\'env\'][\'NODE_ENV\']', 1],
  ['src/main.js', 'import.meta.env.PROD', 1],
  ['src/app/view.js', 'import.meta[\'env\'].MODE', 1],
  ['src/app/view.js', 'const { env } = process;', 1],
  ['src/app/view.js', 'CODEGENA_BUILD_ID', 1],
  ['src/environment.js', 'export const id = process.env.BUILD_ID;', 0],
  ['src/environment.js', 'export const id = CODEGENA_BUILD_ID;', 0],
  ['src/bootstrap.js', 'import { id } from \'./environment\';', 0],
  ['src/dev-mode/bootstrap.js', 'import { id } from \'../environment.ts\';', 0],
  ['src/main.js', 'import(\'./environment\');', 0],
  ['src/app/view.js', 'import { id } from \'../environment\';', 1],
  ['src/app/view.js', 'import(\'/app/environment.ts\');', 0],
  ['src/app/view.js', 'require(\'../environment\');', 1],
  ['src/app/index.js', 'export { id } from \'../environment\';', 1],
  ['src/app/index.js', 'export * from \'../environment\';', 1],
  ['src/app/view.js', 'import { theme } from \'./theme\';', 0],
  ['src/app/view.js', 'import { value } from \'./monaco-environment\';', 0],
  ['.storybook/preview.js', 'import.meta.env.DEV', 1],
  ['.storybook/bootstrap.js', 'CODEGENA_BUILD_ID', 1],
  ['.storybook/environment.js', 'export const dev = import.meta.env.DEV;', 0],
  ['.storybook/preview.js', 'import { id } from \'./environment\';', 0],
  ['.storybook/decorator.js', 'import { id } from \'./environment\';', 1],
  ['.storybook/main.js', 'process.env.BUILD_ID', 0],
  ['.storybook/browser-services-plugin.js', 'process.env.BUILD_ID', 0],
  ['rspack.config.js', 'process.env.BUILD_ID', 0],
];

cases.forEach(([path, code, errors], index) => {
  test(`${index}: ${path}: ${code}`, () => {
    const linter = new Linter({ cwd: '/workspace' });
    const messages = linter.verify(code, [{
      languageOptions: { parser: typescriptEslint.parser },
      plugins: { codegena: { rules: { 'environment-boundary': environmentBoundary } } },
      rules: { 'codegena/environment-boundary': 'error' },
    }], { filename: `/workspace/apps/example/${path}` });

    assert.equal(messages.length, errors, JSON.stringify(messages));
    messages.forEach((message) => {
      assert.equal(message.ruleId, 'codegena/environment-boundary');
      assert.equal(message.severity, 2);
    });
  });
});
