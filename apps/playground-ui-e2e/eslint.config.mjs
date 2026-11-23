import {
  typecheckedForProject,
  configs,
} from '@codegena/infr-nx/eslint-config/index.mjs';
import playwright from 'eslint-plugin-playwright';

export default [
  ...typecheckedForProject(
    '/apps/playground-ui-e2e',
    configs.rootConfig,
  ),
  playwright.configs['flat/recommended'],
];
